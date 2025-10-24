// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MediaFactory
 * @dev Handles user requests and orchestrator payments to AI agent wallets
 */
contract MediaFactory is Ownable {
    // 1. DATA STORAGE

    struct VideoRequest {
        address user;
        string prompt;
        bool isComplete;
        uint256 amountPaid;
    }

    uint256 public nextRequestId;
    mapping(uint256 => VideoRequest) public requests;

    // AP2/x402/MCP FLOW DATA
    struct FlowData {
        // Generic metadata URI (off-chain JSON with details)
        string metadataURI;
        // AP2 fields
        string ap2Nonce;
        string receiptURI; // e.g., URL to signed receipt or job ticket
        string callbackURI; // e.g., backend webhook for status updates
        // x402 fields
        string x402ChallengeURI; // e.g., URL describing 402 challenge/invoice
        // MCP context
        string mcpContextURI; // e.g., URI to context payload/tools manifest
    }

    mapping(uint256 => FlowData) public requestFlows;

    // 2. AGENT WALLETS
    address public scriptAgentWallet;
    address public soundAgentWallet;
    address public videoAgentWallet;

    // 3. EVENTS
    event VideoRequested(
        uint256 indexed requestId,
        address indexed user,
        string prompt
    );

    event AgentPaid(
        uint256 indexed requestId,
        address indexed agentWallet,
        uint256 amount
    );

    // AP2/x402/MCP events
    event AP2FlowDefined(
        uint256 indexed requestId,
        string ap2Nonce,
        string receiptURI,
        string callbackURI,
        string metadataURI
    );

    event X402ChallengeDefined(
        uint256 indexed requestId,
        string challengeURI
    );

    event MCPContextSet(
        uint256 indexed requestId,
        string contextURI
    );

    // 4. CONSTRUCTOR (Initial Setup)
    constructor(
        address _scriptAgent,
        address _soundAgent,
        address _videoAgent
    ) Ownable(msg.sender) {
        scriptAgentWallet = _scriptAgent;
        soundAgentWallet = _soundAgent;
        videoAgentWallet = _videoAgent;
    }

    // 5. FUNCTION 1: User pays to start a job
    function requestVideo(string memory _prompt) public payable {
        require(msg.value > 0.0000001 ether, "Not enough ETH sent");

        uint256 newRequestId = nextRequestId;

        requests[newRequestId] = VideoRequest({
            user: msg.sender,
            prompt: _prompt,
            isComplete: false,
            amountPaid: msg.value
        });

        nextRequestId++;

        emit VideoRequested(newRequestId, msg.sender, _prompt);
    }

    // 6. FUNCTION 2: Backend pays an agent (on-chain proof)
    function payAgent(
        uint256 _requestId,
        address _agentWallet,
        uint256 _amount
    ) public onlyOwner {
        require(requests[_requestId].user != address(0), "Request not found");
        require(address(this).balance >= _amount, "Insufficient contract balance");

        (bool success, ) = _agentWallet.call{value: _amount}("");
        require(success, "Failed to send ETH to agent");

        emit AgentPaid(_requestId, _agentWallet, _amount);
    }

    // 7. FUNCTION 3: Withdraw profits/funds
    function withdraw() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // -------- AP2/x402/MCP HELPERS --------

    // Define AP2 fields and generic metadata for a request
    function defineAP2Flow(
        uint256 _requestId,
        string calldata _ap2Nonce,
        string calldata _receiptURI,
        string calldata _callbackURI,
        string calldata _metadataURI
    ) external onlyOwner {
        require(requests[_requestId].user != address(0), "Request not found");
        FlowData storage flow = requestFlows[_requestId];
        flow.ap2Nonce = _ap2Nonce;
        flow.receiptURI = _receiptURI;
        flow.callbackURI = _callbackURI;
        flow.metadataURI = _metadataURI;
        emit AP2FlowDefined(_requestId, _ap2Nonce, _receiptURI, _callbackURI, _metadataURI);
    }

    // Define an x402 challenge/invoice URI
    function defineX402Challenge(
        uint256 _requestId,
        string calldata _challengeURI
    ) external onlyOwner {
        require(requests[_requestId].user != address(0), "Request not found");
        requestFlows[_requestId].x402ChallengeURI = _challengeURI;
        emit X402ChallengeDefined(_requestId, _challengeURI);
    }

    // Set MCP context URI (tools/context manifest)
    function setMCPContext(
        uint256 _requestId,
        string calldata _contextURI
    ) external onlyOwner {
        require(requests[_requestId].user != address(0), "Request not found");
        requestFlows[_requestId].mcpContextURI = _contextURI;
        emit MCPContextSet(_requestId, _contextURI);
    }

    // Expose chain id for clients to assert Arbitrum networks
    function getChainId() external view returns (uint256) {
        return block.chainid;
    }
}