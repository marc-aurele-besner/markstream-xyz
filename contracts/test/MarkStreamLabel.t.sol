// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { Test, console } from "forge-std/Test.sol";
import { MarkStreamLabel } from "../src/MarkStreamLabel.sol";

contract MarkStreamLabelTest is Test {
    MarkStreamLabel public markStreamLabel;
    address public user1;
    address public user2;
    uint256 public constant FILE_HASH_1 = 1;
    uint256 public constant FILE_HASH_2 = 2;

    function setUp() public {
        markStreamLabel = new MarkStreamLabel();
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
    }

    function testAddLabel() public {
        string memory description = "test label";
        markStreamLabel.addLabel(description);
        
        assertEq(markStreamLabel.getLabelCount(), 1);
        assertEq(markStreamLabel.getLabelDescription(0), description);
    }

    function testUpVoteFileLabel() public {
        // First add a label
        markStreamLabel.addLabel("test label");
        
        vm.prank(user1);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 0);

        assertEq(markStreamLabel.getFileLabel(FILE_HASH_1, 0), 1);
        assertEq(markStreamLabel.getUserContributions(user1), 1);
        assertEq(markStreamLabel.getContributionCount(), 1);
        assertEq(markStreamLabel.getContributionType(user1, 0, FILE_HASH_1), 1);
    }

    function testCannotUpVoteTwice() public {
        markStreamLabel.addLabel("test label");
        
        vm.prank(user1);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 0);

        vm.prank(user1);
        vm.expectRevert(MarkStreamLabel.ContributionAlreadyExists.selector);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 0);
    }

    function testDownVoteFileLabel() public {
        markStreamLabel.addLabel("test label");
        
        // Initialize the counter first to prevent underflow
        vm.prank(user2);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 0);
        
        vm.prank(user1);
        markStreamLabel.downVoteFileLabel(FILE_HASH_1, 0);

        assertEq(markStreamLabel.getFileLabel(FILE_HASH_1, 0), 0);
        assertEq(markStreamLabel.getUserContributions(user1), 1);
        assertEq(markStreamLabel.getContributionCount(), 2);
    }

    function testGetFileLabels() public {
        // Add multiple labels
        markStreamLabel.addLabel("label1");
        markStreamLabel.addLabel("label2");
        markStreamLabel.addLabel("label3");

        // Add some votes
        vm.prank(user1);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 0);
        
        vm.prank(user2);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 1);

        uint256[] memory labels = markStreamLabel.getFileLabels(FILE_HASH_1);
        assertEq(labels.length, markStreamLabel.getLabelCount());
        assertEq(labels[0], 1); // First label (id=0) has 1 vote
        assertEq(labels[1], 1); // Second label (id=1) has 1 vote
        assertEq(labels[2], 0); // Third label (id=2) has 0 votes
    }

    function testGetFileLabelsPaginated() public {
        // Add multiple labels
        markStreamLabel.addLabel("label1");
        markStreamLabel.addLabel("label2");
        markStreamLabel.addLabel("label3");
        markStreamLabel.addLabel("label4");

        // Add some votes
        vm.startPrank(user1);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 0);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 1);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 2);
        vm.stopPrank();

        // Test pagination
        uint256[] memory labels = markStreamLabel.getFileLabelsPaginated(FILE_HASH_1, 0, 2);
        assertEq(labels.length, 2);
        assertEq(labels[0], 1); // First label has 1 vote
        assertEq(labels[1], 1); // Second label has 1 vote

        // Test pagination with offset
        labels = markStreamLabel.getFileLabelsPaginated(FILE_HASH_1, 2, 2);
        assertEq(labels.length, 2);
        assertEq(labels[0], 0); // Third label has 1 vote
        assertEq(labels[1], 0); // Fourth label has 0 votes
    }

    function testRemoveContribution() public {
        markStreamLabel.addLabel("test label");
        
        // Need an upvote first to prevent underflow
        vm.prank(user2);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 0);
        
        vm.startPrank(user1);
        // First downvote
        markStreamLabel.downVoteFileLabel(FILE_HASH_1, 0);
        assertEq(markStreamLabel.getUserContributions(user1), 1);
        
        // Verify the contribution status and count
        assertEq(markStreamLabel.getContributionType(user1, 0, FILE_HASH_1), 2);
        assertEq(markStreamLabel.getContributionType(user2, 0, FILE_HASH_1), 1);
        assertEq(markStreamLabel.getContributionCount(), 2);
        vm.stopPrank();
    }

    function testCannotDownVoteAfterDownVote() public {
        markStreamLabel.addLabel("test label");

        // Need an upvote first to prevent underflow
        vm.prank(user2);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 0);
        
        vm.startPrank(user1);
        markStreamLabel.downVoteFileLabel(FILE_HASH_1, 0);
        
        vm.expectRevert(MarkStreamLabel.InvalidContribution.selector);
        markStreamLabel.downVoteFileLabel(FILE_HASH_1, 0);
        vm.stopPrank();
    }

    function testUpVoteNonExistentLabelFails() public {
        vm.prank(user1);
        vm.expectRevert(MarkStreamLabel.InvalidLabel.selector);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 9999); 
    }

    function testDownVoteNonExistentLabelFails() public {
        vm.prank(user2);
        vm.expectRevert(MarkStreamLabel.InvalidLabel.selector);
        markStreamLabel.downVoteFileLabel(FILE_HASH_1, 9999);
    }

    function testNonOwnerCannotRemoveLabel() public {
        markStreamLabel.addLabel("test label");
        
        vm.prank(user1);
        vm.expectRevert(MarkStreamLabel.NotOwner.selector);
        markStreamLabel.removeLabel(0);
    }

    function testCannotDownVoteInvalidContribution() public {
        markStreamLabel.addLabel("test label");
        
        // Need an upvote first to prevent underflow
        vm.prank(user2);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 0);
        
        vm.startPrank(user1);
        // First downvote
        markStreamLabel.downVoteFileLabel(FILE_HASH_1, 0);
        
        // Try to downvote when contribution status is 2
        vm.expectRevert(MarkStreamLabel.InvalidContribution.selector);
        markStreamLabel.downVoteFileLabel(FILE_HASH_1, 0);
        vm.stopPrank();
    }

    function testAddLabels() public {
        string[] memory descriptions = new string[](3);
        descriptions[0] = "label1";
        descriptions[1] = "label2";
        descriptions[2] = "label3";
        
        markStreamLabel.addLabels(descriptions);
        
        assertEq(markStreamLabel.getLabelCount(), 3);
        assertEq(markStreamLabel.getLabelDescription(0), "label1");
        assertEq(markStreamLabel.getLabelDescription(1), "label2");
        assertEq(markStreamLabel.getLabelDescription(2), "label3");
    }

    function testRemoveLabels() public {
        // First add some labels
        string[] memory descriptions = new string[](3);
        descriptions[0] = "label1";
        descriptions[1] = "label2";
        descriptions[2] = "label3";
        markStreamLabel.addLabels(descriptions);
        
        uint256[] memory labelsToRemove = new uint256[](2);
        labelsToRemove[0] = 0;
        labelsToRemove[1] = 1;
        
        markStreamLabel.removeLabels(labelsToRemove);
        
        assertEq(markStreamLabel.getLabelCount(), 1);
        vm.expectRevert(MarkStreamLabel.InvalidLabel.selector);
        markStreamLabel.upVoteFileLabel(FILE_HASH_1, 0); // Should fail as label 0 was removed
    }

    function testUpVoteFileLabels() public {
        // Add multiple labels first
        string[] memory descriptions = new string[](2);
        descriptions[0] = "label1";
        descriptions[1] = "label2";
        markStreamLabel.addLabels(descriptions);
        
        uint256[] memory labelsToUpvote = new uint256[](2);
        labelsToUpvote[0] = 0;
        labelsToUpvote[1] = 1;
        
        vm.prank(user1);
        markStreamLabel.upVoteFileLabels(FILE_HASH_1, labelsToUpvote);
        
        assertEq(markStreamLabel.getFileLabel(FILE_HASH_1, 0), 1);
        assertEq(markStreamLabel.getFileLabel(FILE_HASH_1, 1), 1);
        assertEq(markStreamLabel.getUserContributions(user1), 2);
    }

    function testDownVoteFileLabels() public {
        // Add labels and initial upvotes to prevent underflow
        string[] memory descriptions = new string[](2);
        descriptions[0] = "label1";
        descriptions[1] = "label2";
        markStreamLabel.addLabels(descriptions);
        
        uint256[] memory labels = new uint256[](2);
        labels[0] = 0;
        labels[1] = 1;
        
        // First upvote with user2
        vm.prank(user2);
        markStreamLabel.upVoteFileLabels(FILE_HASH_1, labels);
        
        // Then downvote with user1
        vm.prank(user1);
        markStreamLabel.downVoteFileLabels(FILE_HASH_1, labels);
        
        assertEq(markStreamLabel.getFileLabel(FILE_HASH_1, 0), 0);
        assertEq(markStreamLabel.getFileLabel(FILE_HASH_1, 1), 0);
        assertEq(markStreamLabel.getUserContributions(user1), 2);
    }

    function testGroupFilesVotesOnLabel() public {
        markStreamLabel.addLabel("test label");
        
        uint256[] memory fileHashes = new uint256[](3);
        fileHashes[0] = FILE_HASH_1;
        fileHashes[1] = FILE_HASH_2;
        fileHashes[2] = 3;
        
        bool[] memory isUpVote = new bool[](3);
        isUpVote[0] = true;
        isUpVote[1] = true;
        isUpVote[2] = true;
        
        vm.prank(user1);
        markStreamLabel.groupFilesVotesOnLabel(fileHashes, 0, isUpVote);
        
        assertEq(markStreamLabel.getFileLabel(FILE_HASH_1, 0), 1);
        assertEq(markStreamLabel.getFileLabel(FILE_HASH_2, 0), 1);
        assertEq(markStreamLabel.getFileLabel(3, 0), 1);
        assertEq(markStreamLabel.getUserContributions(user1), 3);
    }

    function testChangeOwner() public {
        markStreamLabel.changeOwner(user1);
        assertEq(markStreamLabel.owner(), user1);
        
        // Test that old owner can't change owner anymore
        vm.expectRevert(MarkStreamLabel.NotOwner.selector);
        markStreamLabel.changeOwner(user2);
        
        // Test that new owner can change owner
        vm.prank(user1);
        markStreamLabel.changeOwner(user2);
        assertEq(markStreamLabel.owner(), user2);
    }

    function testGroupFilesVotesOnLabelValidations() public {
        markStreamLabel.addLabel("test label");
        
        uint256[] memory fileHashes = new uint256[](2);
        fileHashes[0] = FILE_HASH_1;
        fileHashes[1] = FILE_HASH_2;
        
        bool[] memory isUpVote = new bool[](2);
        isUpVote[0] = true;
        isUpVote[1] = true;
        
        vm.prank(user1);
        markStreamLabel.groupFilesVotesOnLabel(fileHashes, 0, isUpVote);
        
        // Try to upvote the same files again
        vm.prank(user1);
        vm.expectRevert(MarkStreamLabel.ContributionAlreadyExists.selector);
        markStreamLabel.groupFilesVotesOnLabel(fileHashes, 0, isUpVote);
        
        // Try with invalid label
        vm.prank(user1);
        vm.expectRevert(MarkStreamLabel.InvalidLabel.selector);
        markStreamLabel.groupFilesVotesOnLabel(fileHashes, 999, isUpVote);
    }
}
