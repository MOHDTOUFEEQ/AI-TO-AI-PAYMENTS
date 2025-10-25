// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MediaFactory
 * @dev Handles user requests with payment channel support for gas-efficient agent payments
 * 
 * PAYMENT CHANNEL FLOW:
 * 1. User requests video and authorizes fund lock via AP2
 * 2. Orchestrator opens payment channels for each agent (1 TX total)
 * 3. Orchestrator signs off-chain messages for each agent payment (0 gas)
 * 4. Agents close channels when ready to claim (1 TX per agent)
 */
contract MediaFactory is Ownable {
    // 1. DATA STORAGE

    struct VideoRequest {
        address user;
        string prompt;
        bool isComplete;
        uint256 amountPaid;
        bytes32[] channelIds;  // Payment channels opened for this request
        bool channelsOpened;   // Whether payment channels have been opened
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

    // Payment channel reference
    address public paymentChannelContract;

    // 2. AGENT WALLETS
    address public scriptAgentWallet;
    address public soundAgentWallet;
    address public videoAgentWallet;

    // 3. PAYMENT CHANNEL SPLIT (percentages)
    uint256 public scriptAgentShare = 30;  // 30%
    uint256 public soundAgentShare = 30;   // 30%
    uint256 public videoAgentShare = 40;   // 40%

    // 4. EVENTS
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

    event PaymentChannelsOpened(
        uint256 indexed requestId,
        bytes32[] channelIds,
        uint256 totalAmount
    );

    event OffChainPaymentSigned(
        uint256 indexed requestId,
        address indexed agent,
        uint256 amount,
        bytes32 channelId,
        uint256 nonce
    );

    // 5. CONSTRUCTOR (Initial Setup)
    constructor(
        address _scriptAgent,
        address _soundAgent,
        address _videoAgent,
        address _paymentChannelContract
    ) Ownable(msg.sender) {
        scriptAgentWallet = _scriptAgent;
        soundAgentWallet = _soundAgent;
        videoAgentWallet = _videoAgent;
        paymentChannelContract = _paymentChannelContract;
    }

    // 6. FUNCTION 1: User pays to start a job (funds held for payment channels)
    function requestVideo(string memory _prompt) public payable {
        require(msg.value > 0.0000001 ether, "Not enough ETH sent");

        uint256 newRequestId = nextRequestId;
        bytes32[] memory emptyChannels;

        requests[newRequestId] = VideoRequest({
            user: msg.sender,
            prompt: _prompt,
            isComplete: false,
            amountPaid: msg.value,
            channelIds: emptyChannels,
            channelsOpened: false
        });

        nextRequestId++;

        emit VideoRequested(newRequestId, msg.sender, _prompt);
    }

    // 7. FUNCTION 2: Open payment channels for all agents (AP2 authorized)
    function openPaymentChannels(
        uint256 _requestId,
        uint256 _timeout
    ) external onlyOwner returns (bytes32[] memory channelIds) {
        VideoRequest storage request = requests[_requestId];
        require(request.user != address(0), "Request not found");
        require(!request.channelsOpened, "Channels already opened");
        require(address(this).balance >= request.amountPaid, "Insufficient balance");

        // Calculate amounts for each agent based on payment split
        uint256 scriptAmount = (request.amountPaid * scriptAgentShare) / 100;
        uint256 soundAmount = (request.amountPaid * soundAgentShare) / 100;
        uint256 videoAmount = (request.amountPaid * videoAgentShare) / 100;

        // Open channels by calling PaymentChannel contract
        channelIds = new bytes32[](3);
        
        // Open channel for script agent
        bytes32 scriptChannelId = _openChannelForAgent(
            _requestId,
            scriptAgentWallet,
            scriptAmount,
            _timeout
        );
        channelIds[0] = scriptChannelId;

        // Open channel for sound agent
        bytes32 soundChannelId = _openChannelForAgent(
            _requestId,
            soundAgentWallet,
            soundAmount,
            _timeout
        );
        channelIds[1] = soundChannelId;

        // Open channel for video agent
        bytes32 videoChannelId = _openChannelForAgent(
            _requestId,
            videoAgentWallet,
            videoAmount,
            _timeout
        );
        channelIds[2] = videoChannelId;

        // Store channel IDs in request
        request.channelIds = channelIds;
        request.channelsOpened = true;

        emit PaymentChannelsOpened(_requestId, channelIds, request.amountPaid);

        return channelIds;
    }

    // 8. INTERNAL: Open a single payment channel for an agent
    function _openChannelForAgent(
        uint256 _requestId,
        address _agent,
        uint256 _amount,
        uint256 _timeout
    ) internal returns (bytes32) {
        // Call the PaymentChannel contract to open a channel
        (bool success, bytes memory data) = paymentChannelContract.call{value: _amount}(
            abi.encodeWithSignature(
                "openChannel(uint256,address,uint256)",
                _requestId,
                _agent,
                _timeout
            )
        );
        require(success, "Failed to open channel");
        
        // Decode the returned channel ID
        bytes32 channelId = abi.decode(data, (bytes32));
        return channelId;
    }

    // 9. FUNCTION 3: Record off-chain payment signature (for transparency)
    function recordOffChainPayment(
        uint256 _requestId,
        address _agent,
        uint256 _amount,
        bytes32 _channelId,
        uint256 _nonce
    ) external onlyOwner {
        require(requests[_requestId].user != address(0), "Request not found");
        emit OffChainPaymentSigned(_requestId, _agent, _amount, _channelId, _nonce);
    }

    // 10. LEGACY: Backend pays an agent directly (on-chain proof) - kept for backward compatibility
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

    // 11. FUNCTION 4: Update payment channel contract address
    function setPaymentChannelContract(address _paymentChannelContract) external onlyOwner {
        paymentChannelContract = _paymentChannelContract;
    }

    // 12. FUNCTION 5: Update payment splits
    function updatePaymentSplits(
        uint256 _scriptShare,
        uint256 _soundShare,
        uint256 _videoShare
    ) external onlyOwner {
        require(_scriptShare + _soundShare + _videoShare == 100, "Shares must total 100");
        scriptAgentShare = _scriptShare;
        soundAgentShare = _soundShare;
        videoAgentShare = _videoShare;
    }

    // 13. FUNCTION 6: Withdraw profits/funds
    function withdraw() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // 14. VIEW: Get channel IDs for a request
    function getRequestChannels(uint256 _requestId) external view returns (bytes32[] memory) {
        return requests[_requestId].channelIds;
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