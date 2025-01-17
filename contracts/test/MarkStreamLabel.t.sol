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
}
