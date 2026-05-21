export const PropertyTokenABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function delegate(address delegatee)",
  "function delegates(address account) view returns (address)",
  "function getVotes(address account) view returns (uint256)",
  "function owner() view returns (address)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

export const PropertyRegistryABI = [
  "function properties(uint256) view returns (string location, string valuation, string legalDocumentCID, bool isRegistered)",
  "function registerProperty(string memory _location, string memory _valuation, string memory _documentCID)",
  "function updateDocumentCID(uint256 propertyId, string memory _newDocumentCID)",
  "function deleteProperty(uint256 propertyId)",
  "function nextPropertyId() view returns (uint256)",
  "function owner() view returns (address)"
];

export const DividendDistributorABI = [
  "function claimDividend()",
  "function earned(address account) view returns (uint256)",
  "function payRent() payable",
  "function totalDividends() view returns (uint256)",
  "function owner() view returns (address)"
];

export const PropertyDAOABI = [
  "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)",
  "function state(uint256 proposalId) view returns (uint8)",
  "function castVote(uint256 proposalId, uint8 support) returns (uint256)",
  "function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) payable returns (uint256)",
  "function proposalVotes(uint256 proposalId) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
  "function quorum(uint256 blockNumber) view returns (uint256)",
  "function hasVoted(uint256 proposalId, address account) view returns (bool)",
  "function proposalDeadline(uint256 proposalId) view returns (uint256)",
  "function proposalSnapshot(uint256 proposalId) view returns (uint256)",
  "function votingDelay() view returns (uint256)",
  "function votingPeriod() view returns (uint256)",
  "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)"
];
