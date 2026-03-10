// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VotingCore
 * @dev Implementation of a decentralized voting system.
 */
contract VotingCore is Ownable, ReentrancyGuard {
    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 candidateCount;
        string ipfsMetadataHash;
    }

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
        string ipfsImageHash;
    }

    struct Voter {
        bool hasVoted;
        uint256 votedCandidateId;
        uint256 votedElectionId;
    }

    uint256 public electionCount;
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    mapping(uint256 => mapping(address => Voter)) public voters;

    event ElectionCreated(uint256 indexed electionId, string title);
    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter);
    event ElectionEnded(uint256 indexed electionId);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates a new election.
     * @param _title Title of the election.
     * @param _description Description of the election.
     * @param _startTime Timestamp when the election starts.
     * @param _endTime Timestamp when the election ends.
     * @param _ipfsHash IPFS hash for additional metadata.
     */
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        string memory _ipfsHash
    ) external onlyOwner {
        require(_startTime < _endTime, "Start time must be before end time");
        require(_endTime > block.timestamp, "End time must be in the future");

        electionCount++;
        elections[electionCount] = Election({
            id: electionCount,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true,
            candidateCount: 0,
            ipfsMetadataHash: _ipfsHash
        });

        emit ElectionCreated(electionCount, _title);
    }

    /**
     * @dev Adds a candidate to an election.
     * @param _electionId ID of the election.
     * @param _name Name of the candidate.
     * @param _ipfsImageHash IPFS hash for the candidate's image.
     */
    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _ipfsImageHash
    ) external onlyOwner {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        require(elections[_electionId].isActive, "Election is not active");

        Election storage election = elections[_electionId];
        election.candidateCount++;
        uint256 candidateId = election.candidateCount;

        candidates[_electionId][candidateId] = Candidate({
            id: candidateId,
            name: _name,
            voteCount: 0,
            ipfsImageHash: _ipfsImageHash
        });
    }

    /**
     * @dev Casts a vote in an election.
     * @param _electionId ID of the election.
     * @param _candidateId ID of the candidate.
     */
    function castVote(uint256 _electionId, uint256 _candidateId) external nonReentrant {
        Election storage election = elections[_electionId];
        require(election.isActive, "Election is not active");
        require(block.timestamp >= election.startTime, "Election has not started");
        require(block.timestamp <= election.endTime, "Election has ended");
        require(!voters[_electionId][msg.sender].hasVoted, "Already voted in this election");
        require(_candidateId > 0 && _candidateId <= election.candidateCount, "Invalid candidate ID");

        voters[_electionId][msg.sender] = Voter({
            hasVoted: true,
            votedCandidateId: _candidateId,
            votedElectionId: _electionId
        });

        candidates[_electionId][_candidateId].voteCount++;

        emit VoteCast(_electionId, _candidateId, msg.sender);
    }

    /**
     * @dev Ends an election early.
     * @param _electionId ID of the election.
     */
    function endElection(uint256 _electionId) external onlyOwner {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        elections[_electionId].isActive = false;
        emit ElectionEnded(_electionId);
    }

    /**
     * @dev Returns results for an election.
     * @param _electionId ID of the election.
     */
    function getResults(uint256 _electionId) external view returns (string[] memory names, uint256[] memory voteCounts) {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        Election storage election = elections[_electionId];
        uint256 count = election.candidateCount;

        names = new string[](count);
        voteCounts = new uint256[](count);

        for (uint256 i = 1; i <= count; i++) {
            Candidate storage candidate = candidates[_electionId][i];
            names[i - 1] = candidate.name;
            voteCounts[i - 1] = candidate.voteCount;
        }
    }

    /**
     * @dev Returns election details.
     * @param _electionId ID of the election.
     */
    function getElection(uint256 _electionId) external view returns (Election memory) {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        return elections[_electionId];
    }

    /**
     * @dev Checks if an address is eligible to vote (has not voted yet).
     * @param _electionId ID of the election.
     * @param _voter Address of the voter.
     */
    function isEligibleToVote(uint256 _electionId, address _voter) external view returns (bool) {
        return !voters[_electionId][_voter].hasVoted;
    }
}
