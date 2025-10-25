// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title PaymentChannel
 * @dev Implements off-chain payment channels for gas-efficient micro-transactions
 * 
 * Flow:
 * 1. Open Channel (1 TX): Lock funds for a request
 * 2. Off-chain Payments (0 gas): Sign messages for each agent payment
 * 3. Close Channel (1 TX): Agent claims funds with final signed message
 */
contract PaymentChannel is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Channel state
    struct Channel {
        uint256 requestId;
        address payer;          // User who funded the channel
        address payee;          // Agent who receives payments
        uint256 totalDeposit;   // Total amount locked in channel
        uint256 withdrawn;      // Amount already withdrawn
        uint256 nonce;          // Nonce for replay protection
        bool isOpen;            // Channel status
        uint256 openedAt;       // Timestamp when opened
        uint256 timeout;        // Timeout period for disputes
    }

    // Channel ID => Channel
    mapping(bytes32 => Channel) public channels;
    
    // Request ID => Agent Address => Channel ID
    mapping(uint256 => mapping(address => bytes32)) public requestChannels;

    // Events
    event ChannelOpened(
        bytes32 indexed channelId,
        uint256 indexed requestId,
        address indexed payer,
        address payee,
        uint256 amount,
        uint256 timeout
    );

    event ChannelClosed(
        bytes32 indexed channelId,
        uint256 indexed requestId,
        address indexed payee,
        uint256 finalAmount,
        uint256 refunded
    );

    event ChannelPaymentSigned(
        bytes32 indexed channelId,
        uint256 indexed requestId,
        address indexed payee,
        uint256 amount,
        uint256 nonce
    );

    event ChannelDisputed(
        bytes32 indexed channelId,
        uint256 indexed requestId,
        string reason
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Opens a payment channel for an agent on a specific request
     * @param _requestId The video request ID
     * @param _payee The agent wallet address
     * @param _timeout Timeout period in seconds (default: 7 days)
     */
    function openChannel(
        uint256 _requestId,
        address _payee,
        uint256 _timeout
    ) external payable returns (bytes32 channelId) {
        require(msg.value > 0, "Must deposit funds");
        require(_payee != address(0), "Invalid payee");
        require(_timeout > 0, "Invalid timeout");

        // Generate unique channel ID
        channelId = keccak256(
            abi.encodePacked(
                _requestId,
                msg.sender,
                _payee,
                block.timestamp
            )
        );

        require(!channels[channelId].isOpen, "Channel already exists");

        channels[channelId] = Channel({
            requestId: _requestId,
            payer: msg.sender,
            payee: _payee,
            totalDeposit: msg.value,
            withdrawn: 0,
            nonce: 0,
            isOpen: true,
            openedAt: block.timestamp,
            timeout: _timeout
        });

        requestChannels[_requestId][_payee] = channelId;

        emit ChannelOpened(
            channelId,
            _requestId,
            msg.sender,
            _payee,
            msg.value,
            _timeout
        );

        return channelId;
    }

    /**
     * @dev Closes a channel and pays out to the agent based on signed message
     * @param _channelId The channel ID
     * @param _amount Final amount to pay the agent
     * @param _nonce Nonce from the signed message (must match or exceed channel nonce)
     * @param _signature Signature from the payer authorizing the payment
     */
    function closeChannel(
        bytes32 _channelId,
        uint256 _amount,
        uint256 _nonce,
        bytes memory _signature
    ) external {
        Channel storage channel = channels[_channelId];
        
        require(channel.isOpen, "Channel not open");
        require(msg.sender == channel.payee || msg.sender == channel.payer || msg.sender == owner(), 
                "Only payee, payer, or owner can close");
        require(_amount <= channel.totalDeposit, "Amount exceeds deposit");
        require(_nonce >= channel.nonce, "Invalid nonce");

        // Verify signature from payer
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                _channelId,
                channel.requestId,
                channel.payee,
                _amount,
                _nonce
            )
        );
        
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address recovered = ethSignedHash.recover(_signature);
        
        require(recovered == channel.payer || recovered == owner(), 
                "Invalid signature");

        // Calculate payout and refund
        uint256 payoutAmount = _amount;
        uint256 refundAmount = channel.totalDeposit - _amount;

        // Mark channel as closed
        channel.isOpen = false;
        channel.withdrawn = _amount;
        channel.nonce = _nonce;

        // Transfer funds
        if (payoutAmount > 0) {
            (bool payeeSuccess, ) = channel.payee.call{value: payoutAmount}("");
            require(payeeSuccess, "Payee transfer failed");
        }

        if (refundAmount > 0) {
            (bool payerSuccess, ) = channel.payer.call{value: refundAmount}("");
            require(payerSuccess, "Payer refund failed");
        }

        emit ChannelClosed(
            _channelId,
            channel.requestId,
            channel.payee,
            payoutAmount,
            refundAmount
        );
    }

    /**
     * @dev Emergency channel closure after timeout (if payer becomes unresponsive)
     * @param _channelId The channel ID
     */
    function emergencyClose(bytes32 _channelId) external {
        Channel storage channel = channels[_channelId];
        
        require(channel.isOpen, "Channel not open");
        require(msg.sender == channel.payee, "Only payee can emergency close");
        require(
            block.timestamp >= channel.openedAt + channel.timeout,
            "Timeout not reached"
        );

        // Close channel and pay full amount to agent (assuming work was done)
        uint256 payoutAmount = channel.totalDeposit;
        channel.isOpen = false;
        channel.withdrawn = payoutAmount;

        (bool success, ) = channel.payee.call{value: payoutAmount}("");
        require(success, "Transfer failed");

        emit ChannelClosed(
            _channelId,
            channel.requestId,
            channel.payee,
            payoutAmount,
            0
        );
    }

    /**
     * @dev Verifies a signed payment message (off-chain verification helper)
     * @param _channelId The channel ID
     * @param _amount Amount in the signed message
     * @param _nonce Nonce in the signed message
     * @param _signature The signature to verify
     * @return bool True if signature is valid
     */
    function verifySignature(
        bytes32 _channelId,
        uint256 _amount,
        uint256 _nonce,
        bytes memory _signature
    ) external view returns (bool) {
        Channel storage channel = channels[_channelId];
        
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                _channelId,
                channel.requestId,
                channel.payee,
                _amount,
                _nonce
            )
        );
        
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address recovered = ethSignedHash.recover(_signature);
        
        return recovered == channel.payer || recovered == owner();
    }

    /**
     * @dev Gets channel information
     * @param _channelId The channel ID
     */
    function getChannel(bytes32 _channelId) external view returns (Channel memory) {
        return channels[_channelId];
    }

    /**
     * @dev Gets channel ID for a request and agent
     * @param _requestId The request ID
     * @param _agent The agent address
     */
    function getChannelId(uint256 _requestId, address _agent) external view returns (bytes32) {
        return requestChannels[_requestId][_agent];
    }

    /**
     * @dev Emergency withdrawal by owner (only for stuck funds)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}

