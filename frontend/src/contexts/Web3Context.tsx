import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BrowserProvider, Contract, Eip1193Provider } from "ethers";

interface Web3ContextType {
	provider: BrowserProvider | null;
	signer: any | null;
	contract: Contract | null;
	address: string | null;
	isConnected: boolean;
	connectWallet: () => Promise<boolean>;
	error: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Contract configuration
const CONTRACT_ADDRESS = "0x6417C3ca31418E510269787D56B346e59846dC49";
const CONTRACT_ABI = ["function requestVideo(string memory _prompt) public payable", "event VideoRequested(uint256 indexed requestId, address indexed user, string prompt)", "event PaymentChannelsOpened(uint256 indexed requestId, bytes32[] channelIds, uint256 totalAmount)"];

export const Web3Provider = ({ children }: { children: ReactNode }) => {
	const [provider, setProvider] = useState<BrowserProvider | null>(null);
	const [signer, setSigner] = useState<any | null>(null);
	const [contract, setContract] = useState<Contract | null>(null);
	const [address, setAddress] = useState<string | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const initWeb3 = async () => {
		if (typeof window.ethereum === "undefined") {
			setError("Please install MetaMask to use this app");
			return false;
		}

		try {
			const web3Provider = new BrowserProvider(window.ethereum as Eip1193Provider);
			setProvider(web3Provider);
			return true;
		} catch (err) {
			console.error("Web3 initialization error:", err);
			setError("Error initializing Web3");
			return false;
		}
	};

	const connectWallet = async () => {
		let currentProvider = provider;

		if (!currentProvider) {
			const initialized = await initWeb3();
			if (!initialized) return false;
			currentProvider = new BrowserProvider(window.ethereum as Eip1193Provider);
			setProvider(currentProvider);
		}

		try {
			const accounts = (await window.ethereum?.request({
				method: "eth_requestAccounts",
			})) as string[];

			if (accounts.length === 0) {
				setError("No accounts found. Please unlock MetaMask.");
				return false;
			}

			const web3Signer = await currentProvider.getSigner();
			const web3Contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);
			const userAddress = await web3Signer.getAddress();

			setSigner(web3Signer);
			setContract(web3Contract);
			setAddress(userAddress);
			setIsConnected(true);
			setError(null);

			return true;
		} catch (err: any) {
			console.error("Wallet connection error:", err);
			setError("Failed to connect wallet: " + err.message);
			return false;
		}
	};

	// Check if wallet is already connected on mount
	useEffect(() => {
		const checkConnection = async () => {
			if (typeof window.ethereum === "undefined") {
				return;
			}

			try {
				const initialized = await initWeb3();
				if (!initialized) return;

				const accounts = (await window.ethereum.request({
					method: "eth_accounts",
				})) as string[];

				if (accounts.length > 0) {
					await connectWallet();
				}
			} catch (err) {
				console.error("Auto-connect error:", err);
			}
		};

		checkConnection();
	}, []);

	// Listen for account changes
	useEffect(() => {
		if (window.ethereum) {
			const handleAccountsChanged = (accounts: string[]) => {
				if (accounts.length === 0) {
					setIsConnected(false);
					setAddress(null);
					setSigner(null);
					setContract(null);
				} else {
					connectWallet();
				}
			};

			window.ethereum.on("accountsChanged", handleAccountsChanged);

			return () => {
				window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
			};
		}
	}, []);

	return (
		<Web3Context.Provider
			value={{
				provider,
				signer,
				contract,
				address,
				isConnected,
				connectWallet,
				error,
			}}
		>
			{children}
		</Web3Context.Provider>
	);
};

export const useWeb3 = () => {
	const context = useContext(Web3Context);
	if (context === undefined) {
		throw new Error("useWeb3 must be used within a Web3Provider");
	}
	return context;
};
