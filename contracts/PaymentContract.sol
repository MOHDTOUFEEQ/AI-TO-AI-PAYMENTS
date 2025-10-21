// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentContract {
    address public owner;
    address payable public receiver; // Agent B

    event Paid(address indexed payer, address indexed receiver, uint256 amount, bytes meta);

    constructor(address payable _receiver) {
        owner = msg.sender;
        receiver = _receiver;
    }

    // Allow owner to change receiver if needed
    function setReceiver(address payable _newReceiver) external {
        require(msg.sender == owner, "only owner");
        receiver = _newReceiver;
    }

    // Payable function: Agent A calls this and sends ETH.
    // Contract immediately forwards funds to receiver and emits an event for Agent B to listen.
    function pay(bytes calldata meta) external payable {
        require(msg.value > 0, "Send some ETH");
        // forward funds
        (bool sent,) = receiver.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
        emit Paid(msg.sender, receiver, msg.value, meta);
    }

    // Fallback to accept ETH if sent directly
    receive() external payable {
        // If received directly, forward to receiver
        (bool sent,) = receiver.call{value: msg.value}("");
        require(sent, "Failed to forward");
        emit Paid(msg.sender, receiver, msg.value, "");
    }
}
