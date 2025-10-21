from web3 import Web3
from config import ARBITRUM_RPC, AGENT_A_PRIVATE_KEY, AGENT_B_ADDRESS, CONTRACT_ADDRESS, CONTRACT_ABI
import json

# Connect to Arbitrum Sepolia
w3 = Web3(Web3.HTTPProvider(ARBITRUM_RPC))
account = w3.eth.account.from_key(AGENT_A_PRIVATE_KEY)

# Connect to deployed contract
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

# AP2/x402 style request
request_payload = {
    "from_agent": account.address,
    "to_agent": AGENT_B_ADDRESS,
    "task": "summarize_text",
    "task_metadata": {"text": "This is a very long text to summarize"},
    "payment": {"amount_eth": 0.001, "currency": "ETH", "network": "arbitrum-sepolia"},
    "request_id": "request_001"
}

def send_payment():
    amount_wei = w3.toWei(request_payload["payment"]["amount_eth"], "ether")
    txn = contract.functions.payAgent().buildTransaction({
        "from": account.address,
        "value": amount_wei,
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": 200000
    })
    signed_txn = account.sign_transaction(txn)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    print(f"Payment sent, tx hash: {tx_hash.hex()}")
    return request_payload["request_id"]

if __name__ == "__main__":
    request_id = send_payment()
    print(f"Request {request_id} sent to Agent B")
