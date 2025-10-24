// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PaymentContract
 * @dev Smart contract for handling AI-to-AI payments
 * This contract allows verified payments between AI agents
 */
contract PaymentContract {
    // Events
    event PaymentReceived(
        address indexed from,
        address indexed to,
        address indexed token,
        uint256 amount,
        string txHash
    );
    
    event InvoiceCreated(
        uint256 indexed invoiceId,
        address indexed recipient,
        address indexed asset,
        uint256 amount
    );
    
    // Structs
    struct Invoice {
        address recipient;
        address asset;
        uint256 amount;
        bool paid;
        uint256 timestamp;
    }
    
    // State variables
    mapping(uint256 => Invoice) public invoices;
    mapping(string => bool) public usedTxHashes; // Prevent double spending
    uint256 public invoiceCounter;
    
    address public owner;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Create an invoice for payment
     * @param recipient Address to receive payment
     * @param asset Token address (address(0) for native ETH)
     * @param amount Amount to be paid
     * @return invoiceId The ID of the created invoice
     */
    function createInvoice(
        address recipient,
        address asset,
        uint256 amount
    ) external returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        
        invoiceCounter++;
        invoices[invoiceCounter] = Invoice({
            recipient: recipient,
            asset: asset,
            amount: amount,
            paid: false,
            timestamp: block.timestamp
        });
        
        emit InvoiceCreated(invoiceCounter, recipient, asset, amount);
        return invoiceCounter;
    }
    
    /**
     * @dev Verify a payment transaction
     * @param txHash Transaction hash of the payment
     * @param from Sender address
     * @param to Recipient address
     * @param token Token address
     * @param amount Amount paid
     */
    function verifyPayment(
        string memory txHash,
        address from,
        address to,
        address token,
        uint256 amount
    ) external onlyOwner {
        require(!usedTxHashes[txHash], "Transaction already verified");
        require(from != address(0), "Invalid sender");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        usedTxHashes[txHash] = true;
        
        emit PaymentReceived(from, to, token, amount, txHash);
    }
    
    /**
     * @dev Check if a transaction hash has been used
     * @param txHash Transaction hash to check
     * @return bool True if already used
     */
    function isTxHashUsed(string memory txHash) external view returns (bool) {
        return usedTxHashes[txHash];
    }
    
    /**
     * @dev Get invoice details
     * @param invoiceId ID of the invoice
     * @return Invoice struct
     */
    function getInvoice(uint256 invoiceId) external view returns (Invoice memory) {
        return invoices[invoiceId];
    }
}

