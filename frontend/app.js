// Contract address - deployed on Arbitrum Sepolia
const CONTRACT_ADDRESS = "0x6720c5604b76801F1475333DAf7Bd7E6D7D16c33";

// Minimal ABI
const CONTRACT_ABI = ["function requestVideo(string memory _prompt) public payable", "event VideoRequested(uint256 indexed requestId, address indexed user, string prompt)"];

let provider, signer, contract;

async function initWeb3() {
	if (typeof window.ethereum === "undefined") {
		console.error("MetaMask not found");
		showStatus("Please install MetaMask to use this app", "error");
		return false;
	}

	try {
		console.log("Initializing ethers provider...");
		provider = new ethers.BrowserProvider(window.ethereum);
		console.log("Provider created successfully");

		// Don't get signer yet - wait until user connects
		console.log("Web3 initialized successfully");
		return true;
	} catch (error) {
		console.error("Web3 initialization error:", error);
		showStatus("Error initializing Web3: " + error.message, "error");
		return false;
	}
}

async function connectWallet() {
	if (!provider) {
		const initialized = await initWeb3();
		if (!initialized) return false;
	}

	try {
		// Request account access
		const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

		if (accounts.length === 0) {
			showStatus("No accounts found. Please unlock MetaMask.", "error");
			return false;
		}

		// Get the signer again to ensure it's updated
		signer = await provider.getSigner();
		contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

		const address = await signer.getAddress();
		showStatus(`Connected: ${address}`, "success");
		return true;
	} catch (error) {
		console.error("Wallet connection error:", error);
		showStatus("Failed to connect wallet: " + error.message, "error");
		return false;
	}
}

function showStatus(message, type) {
	const statusEl = document.getElementById("status");
	statusEl.textContent = message;
	statusEl.className = `status ${type}`;
}

document.getElementById("requestForm").addEventListener("submit", async (e) => {
	e.preventDefault();

	const prompt = document.getElementById("prompt").value;
	const amount = document.getElementById("amount").value;

	if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
		showStatus("⚠️ Please set CONTRACT_ADDRESS in app.js", "error");
		return;
	}

	const connected = await connectWallet();
	if (!connected) return;

	const submitBtn = document.getElementById("submitBtn");
	submitBtn.disabled = true;
	submitBtn.textContent = "Submitting...";

	try {
		const amountWei = ethers.parseEther(amount);

		showStatus("Waiting for transaction confirmation...", "info");

		const tx = await contract.requestVideo(prompt, { value: amountWei });

		showStatus(`Transaction sent: ${tx.hash}`, "info");

		const receipt = await tx.wait();

		// Find the VideoRequested event
		const event = receipt.logs.find((log) => {
			try {
				const parsed = contract.interface.parseLog(log);
				return parsed.name === "VideoRequested";
			} catch {
				return false;
			}
		});

		if (event) {
			const parsed = contract.interface.parseLog(event);
			const requestId = parsed.args.requestId.toString();

			showStatus(`✅ Video request submitted! Request ID: ${requestId}`, "success");

			// Reset form
			document.getElementById("prompt").value = "";
		} else {
			showStatus("Request submitted but could not find event", "info");
		}
	} catch (error) {
		console.error(error);
		showStatus("Error: " + error.message, "error");
	} finally {
		submitBtn.disabled = false;
		submitBtn.textContent = "Generate Video";
	}
});

// Check if wallet is available on page load
window.addEventListener("load", async () => {
	console.log("Page loaded, checking for MetaMask...");

	if (typeof window.ethereum === "undefined") {
		console.error("window.ethereum is undefined");
		showStatus("Please install MetaMask to use this app", "error");
		return;
	}

	console.log("MetaMask detected");

	try {
		// Initialize provider
		const initialized = await initWeb3();
		if (!initialized) {
			console.error("Web3 initialization failed");
			showStatus("Failed to initialize. Please refresh the page.", "error");
			return;
		}

		// Check if already connected
		const accounts = await window.ethereum.request({ method: "eth_accounts" });
		console.log("Existing accounts:", accounts);

		if (accounts.length > 0) {
			// Already connected, get signer and update UI
			signer = await provider.getSigner();
			contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
			const address = await signer.getAddress();
			console.log("Already connected to:", address);
			showStatus(`Connected: ${address}`, "success");
		} else {
			// Not connected, show instruction
			console.log("No accounts connected");
			showStatus("Click 'Generate Video' to connect your wallet", "info");
		}
	} catch (error) {
		console.error("Page load error:", error);
		showStatus("Click 'Generate Video' to connect your wallet", "info");
	}
});
