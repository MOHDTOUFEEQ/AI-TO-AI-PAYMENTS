import { Info, Zap, Shield, TrendingDown } from "lucide-react";

const PaymentChannelInfo = () => {
	return (
		<div className="glass-card max-w-2xl mx-auto p-6 mb-6 border border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
			<div className="flex items-start gap-3 mb-4">
				<div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
					<Info className="w-5 h-5 text-secondary" />
				</div>
				<div className="max-w-2xl mx-auto">
					<h3 className="text-lg font-semibold mb-1">Payment Channel Technology</h3>
					<p className="text-sm text-foreground/70">Experience gas-efficient AI agent payments on Arbitrum</p>
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-start gap-3 text-sm">
					<Zap className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
					<div className="max-w-2xl mx-auto">
						<span className="font-medium text-foreground">Instant Off-Chain Settlements</span>
						<p className="text-foreground/60 text-xs mt-0.5">Agents receive signed payment commitments instantly (0 gas cost)</p>
					</div>
				</div>

				<div className="flex items-start gap-3 text-sm">
					<TrendingDown className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
					<div className="max-w-2xl mx-auto">
						<span className="font-medium text-foreground">Gas Optimization</span>
						<p className="text-foreground/60 text-xs mt-0.5">Open 3 channels in 1 transaction, save ~105,000 gas vs traditional payments</p>
					</div>
				</div>

				<div className="flex items-start gap-3 text-sm">
					<Shield className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
					<div className="max-w-2xl mx-auto">
						<span className="font-medium text-foreground">Secure & Verifiable</span>
						<p className="text-foreground/60 text-xs mt-0.5">Cryptographic signatures + AP2 & x402 protocols ensure trustless operations</p>
					</div>
				</div>
			</div>

			<div className="mt-4 pt-4 border-t border-white/10">
				<p className="text-xs text-foreground/50">
					<span className="font-semibold text-secondary">How it works:</span> Your payment opens 3 channels → Agents work & get signed payments (off-chain) → Channels close when agents claim funds
				</p>
			</div>
		</div>
	);
};

export default PaymentChannelInfo;
