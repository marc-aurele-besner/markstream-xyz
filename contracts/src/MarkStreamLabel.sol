// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract MarkStreamLabel {
    uint256 public labelCount;
    uint256 public contributionCount;
    address public owner;

    mapping(uint256 label => mapping(uint256 fileHash => uint256)) public filesLabels;

    mapping(uint256 label => string) public labelsDescription;
    
    mapping(uint256 label => bool) public labels;

    mapping(address contributor => mapping(uint256 label => mapping(uint256 fileHash => uint8))) public contributionType;

    mapping(address contributor => uint256) public userContributions;

    event LabelAdded(uint256 label, string description, address contributor);
    event LabelRemoved(uint256 label, address contributor);
    event LabelUpVoted(uint256 label, uint256 fileHash, address contributor);
    event LabelDownVoted(uint256 label, uint256 fileHash, address contributor);
    event OwnerChanged(address newOwner);

    error InvalidLabel();
    error ContributionAlreadyExists();
    error InvalidContribution();
    error NotOwner();

    modifier newContribution(address contributor, uint256 label, uint256 fileHash) {
        if (contributionType[contributor][label][fileHash] != 0)
            revert ContributionAlreadyExists();
        _;
    }

    modifier validLabel(uint256 label) {
        if (!labels[label])
            revert InvalidLabel();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner)
            revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function _onNewContribution(address contributor, uint256 label, uint256 fileHash, uint8 newContributionType) internal {
        contributionType[contributor][label][fileHash] = newContributionType;
        userContributions[contributor]++;
        contributionCount++;
    }

    function _onRemoveContribution(address contributor, uint256 label, uint256 fileHash, uint8 newContributionType) internal {
        contributionType[contributor][label][fileHash] = newContributionType;
        userContributions[contributor]--;
        contributionCount--;
    }

    function addLabel(string memory description) public {
        labels[labelCount] = true;
        labelsDescription[labelCount] = description;
        labelCount++;
        emit LabelAdded(labelCount - 1, description, msg.sender);
    }

    function removeLabel(uint256 label) public onlyOwner {
        delete labels[label];
        delete labelsDescription[label];
        labelCount--;
        emit LabelRemoved(label, msg.sender);
    }

    function upVoteFileLabel(uint256 fileHash, uint256 label) public validLabel(label) newContribution(msg.sender, label, fileHash) {
        uint8 _contributionType = contributionType[msg.sender][label][fileHash];
        if (_contributionType == 0)
            _onNewContribution(msg.sender, label, fileHash, 1);
        else if (_contributionType == 2)
            _onRemoveContribution(msg.sender, label, fileHash, 1);
        else
            revert InvalidContribution();
        filesLabels[label][fileHash]++;
        emit LabelUpVoted(label, fileHash, msg.sender);
    }

    function downVoteFileLabel(uint256 fileHash, uint256 label) public validLabel(label) {
        uint8 _contributionType = contributionType[msg.sender][label][fileHash];
        if (_contributionType == 0)
            _onNewContribution(msg.sender, label, fileHash, 2);
        else if (_contributionType == 1)
            _onRemoveContribution(msg.sender, label, fileHash, 2);
        else
            revert InvalidContribution();
        filesLabels[label][fileHash]--;
        emit LabelDownVoted(label, fileHash, msg.sender);
    }

    function changeOwner(address newOwner) public onlyOwner {
        owner = newOwner;
        emit OwnerChanged(newOwner);
    }

    function getFileLabel(uint256 fileHash, uint256 label) public view returns (uint256) {
        return filesLabels[label][fileHash];
    }

    function getFileLabels(uint256 fileHash) public view returns (uint256[] memory) {
        uint256[] memory _labels = new uint256[](labelCount);
        for (uint256 i = 0; i < labelCount; i++) {
            _labels[i] = filesLabels[i][fileHash];
        }
        return _labels;
    }

    function getFileLabelsPaginated(uint256 fileHash, uint256 offset, uint256 limit) public view returns (uint256[] memory) {
        if (offset >= labelCount)
            return new uint256[](0);

        uint256 end = offset + limit;
        if (end > labelCount) {
            end = labelCount;
        }

        uint256 size = end - offset;
        uint256[] memory _labels = new uint256[](size);

        for (uint256 i = offset; i < end; i++) {
            _labels[i - offset] = filesLabels[i + 1][fileHash];
        }

        return _labels;
    }

    function getLabelDescription(uint256 label) public view returns (string memory) {
        return labelsDescription[label];
    }

    function getLabelCount() public view returns (uint256) {
        return labelCount;
    }

    function getUserContributions(address contributor) public view returns (uint256) {
        return userContributions[contributor];
    }

    function getContributionCount() public view returns (uint256) {
        return contributionCount;
    }

    function getContributionType(address contributor, uint256 label, uint256 fileHash) public view returns (uint8) {
        return contributionType[contributor][label][fileHash];
    }
}
