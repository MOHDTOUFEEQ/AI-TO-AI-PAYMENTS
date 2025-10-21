from web3 import Web3
from config import ARBITRUM_RPC, CONTRACT_ADDRESS, CONTRACT_ABI
import time

# Connect to Arbitrum Sepolia
w3 = Web3(Web3.HTTPProvider(ARBITRUM_RPC))
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

# Listen for PaymentMade events
event_filter = contract.events.PaymentMade.createFilter(fromBlock='latest')

def process_ai_task(event):
    print("Payment detected! Processing AI task...")
    # Simulate AI task: Summarize text
    request_id = event['args']['from'] + "_to_" + event['args']['to']
    # Here you can integrate real AI, for demo just reverse text
    original_text = "This is a very long text to summarize"
    summarized_text = original_text[:50] + "..."  # Simple demo
    print(f"Request {request_id}: AI Output -> {summarized_text}")

while True:
    for event in event_filter.get_new_entries():
        process_ai_task(event)
    time.sleep(2)
