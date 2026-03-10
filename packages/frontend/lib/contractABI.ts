export const VOTING_ABI = [
    "function electionCount() view returns (uint256)",
    "function elections(uint256) view returns (uint256 id, string title, string description, uint256 startTime, uint256 endTime, bool isActive, uint256 candidateCount, string ipfsMetadataHash)",
    "function candidates(uint256, uint256) view returns (uint256 id, string name, uint256 voteCount, string ipfsImageHash)",
    "function castVote(uint256 electionId, uint256 candidateId)",
    "function getResults(uint256 electionId) view returns (string[] names, uint256[] voteCounts)",
    "function createElection(string title, string description, uint256 startTime, uint256 endTime, string ipfsHash)",
    "function addCandidate(uint256 electionId, string name, string ipfsImageHash)",
    "function isEligibleToVote(uint256 electionId, address voter) view returns (bool)",
    "event ElectionCreated(uint256 indexed electionId, string title)",
    "event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter)"
] as const;
