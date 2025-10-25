import { useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Sparkles, Wallet } from "lucide-react";

const VideoRequestForm = () => {
	const { contract, address, isConnected, connectWallet } = useWeb3();
	const [prompt, setPrompt] = useState("");
	const [amount, setAmount] = useState("0.000001");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!contract) {
			const connected = await connectWallet();
			if (!connected) {
				toast.error("Failed to connect wallet. Please try again.");
				return;
			}
		}

		if (!contract) {
			toast.error("Contract not initialized. Please refresh and try again.");
			return;
		}

		setIsSubmitting(true);

		try {
			const amountWei = parseEther(amount);

			toast.info("Waiting for transaction confirmation...");

			const tx = await contract.requestVideo(prompt, { value: amountWei });

			toast.info(`Transaction sent: ${tx.hash.substring(0, 10)}...`);

			const receipt = await tx.wait();

			// Find the VideoRequested event
			const event = receipt.logs.find((log: any) => {
				try {
					const parsed = contract.interface.parseLog(log);
					return parsed?.name === "VideoRequested";
				} catch {
					return false;
				}
			});

			if (event) {
				const parsed = contract.interface.parseLog(event);
				const requestId = parsed?.args.requestId.toString();

				toast.success(`Video request submitted! Request ID: ${requestId}\n` + `Payment channels will be opened for agents (gas-efficient off-chain payments)\n` + `Video generation will begin automatically`, { duration: 8000 });

				console.log(`Video request submitted! Request ID: ${requestId}`);
				console.log("Payment channels will be opened by the orchestrator");
				console.log("Agents will receive off-chain signed payments (0 gas!)");

				// Reset form
				setPrompt("");
			} else {
				toast.success("Request submitted successfully!");
			}
		} catch (err: any) {
			console.error(err);
			toast.error("Error: " + (err.message || "Transaction failed"));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col h-full">
			{/* Connection Status */}
			{isConnected && address && (
				<div className="mb-6 p-4 glass-card border border-green-500/20 bg-green-500/10">
					<div className="flex items-center gap-2 text-green-400">
						<Wallet className="w-4 h-4" />
						<span className="text-sm font-medium">
							Connected: {address.substring(0, 6)}...{address.substring(38)}
						</span>
					</div>
				</div>
			)}

			{/* Form */}
			<form onSubmit={handleSubmit} className="flex flex-col gap-6 h-full">
				<div className="space-y-2">
					<Label htmlFor="prompt" className="text-base">
						Video Prompt
					</Label>
					<Textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the video you want to create..." rows={4} required className="bg-background/50 flex-grow border-white/10 focus:border-secondary/50 resize-none" />
				</div>
				<div className="space-y-2">
					<Label htmlFor="amount" className="text-base">
						Payment Amount (ETH)
					</Label>
					<div className="relative">
						<Input id="amount" type="number" step="0.0000001" min="0.0000001" value={amount} onChange={(e) => setAmount(e.target.value)} required className="bg-background/50 border-white/10 focus:border-secondary/50 pr-16" />
						<span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-foreground/60 font-medium">ETH</span>
					</div>
				</div>

				<Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg font-medium bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70">
					{isSubmitting ? (
						<>
							<Loader2 className="w-5 h-5 mr-2 animate-spin" />
							Submitting...
						</>
					) : (
						<>
							<Sparkles className="w-5 h-5 mr-2" />
							Generate Video
						</>
					)}
				</Button>
			</form>
			{/* Info Box */}
			<div className="glass-card p-6 mt-6 border border-white/10">
				<div className="space-y-2 text-sm">
					<div className="flex items-center justify-between">
						<span className="text-foreground/70">Minimum payment:</span>
						<span className="font-medium">0.000001 ETH</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VideoRequestForm;
