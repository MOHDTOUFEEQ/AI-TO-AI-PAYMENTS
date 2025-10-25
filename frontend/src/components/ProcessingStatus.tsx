import { useEffect, useState } from "react";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ProcessingPhase = "idle" | "detecting" | "authorization" | "channels" | "settlements" | "closing" | "complete";

interface ProcessingStatusProps {
	className?: string;
}

const ProcessingStatus = ({ className }: ProcessingStatusProps) => {
	const [phase, setPhase] = useState<ProcessingPhase>("idle");
	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		// Listen for orchestrator events to update phase
		const orchestratorUrl = import.meta.env.VITE_ORCHESTRATOR_URL || "http://localhost:3001";
		const eventSource = new EventSource(`${orchestratorUrl}/api/logs/stream`);

		eventSource.onmessage = (event) => {
			try {
				const log = JSON.parse(event.data);
				const message = log.message?.toLowerCase() || "";

				// Update phase based on log content
				if (message.includes("new video request detected")) {
					setPhase("detecting");
					setIsProcessing(true);
				} else if (message.includes("ap2") || message.includes("authorization")) {
					setPhase("authorization");
				} else if (message.includes("payment channels opened")) {
					setPhase("channels");
				} else if (message.includes("settlement") || message.includes("off-chain payment")) {
					setPhase("settlements");
				} else if (message.includes("closing") || message.includes("channel closed")) {
					setPhase("closing");
				} else if (message.includes("complete payment channel flow finished")) {
					setPhase("complete");
					setTimeout(() => {
						setIsProcessing(false);
						setPhase("idle");
					}, 5000);
				}
			} catch (error) {
				// Ignore parsing errors
			}
		};

		return () => {
			eventSource.close();
		};
	}, []);

	const getPhaseInfo = () => {
		switch (phase) {
			case "detecting":
				return { label: "Detecting Request", icon: Loader2, color: "text-blue-400", bgColor: "bg-blue-500/10" };
			case "authorization":
				return { label: "Setting up Authorization", icon: Loader2, color: "text-purple-400", bgColor: "bg-purple-500/10" };
			case "channels":
				return { label: "Opening Payment Channels", icon: Loader2, color: "text-yellow-400", bgColor: "bg-yellow-500/10" };
			case "settlements":
				return { label: "Processing Settlements", icon: Loader2, color: "text-cyan-400", bgColor: "bg-cyan-500/10" };
			case "closing":
				return { label: "Closing Channels", icon: Loader2, color: "text-orange-400", bgColor: "bg-orange-500/10" };
			case "complete":
				return { label: "Complete!", icon: CheckCircle, color: "text-green-400", bgColor: "bg-green-500/10" };
			default:
				return { label: "Ready", icon: Clock, color: "text-gray-400", bgColor: "bg-gray-500/10" };
		}
	};

	const phaseInfo = getPhaseInfo();
	const Icon = phaseInfo.icon;

	if (!isProcessing && phase === "idle") {
		return null;
	}

	return (
		<div className={cn("glass-card p-4 border border-white/10", className)}>
			<div className="flex items-center gap-3">
				<div className={cn("p-2 rounded-lg", phaseInfo.bgColor)}>
					<Icon className={cn("w-5 h-5", phaseInfo.color, phase !== "complete" && phase !== "idle" && "animate-spin")} />
				</div>
				<div className="flex-1">
					<p className="text-sm font-medium text-foreground">{phaseInfo.label}</p>
					<p className="text-xs text-foreground/60">Watch the terminal for details →</p>
				</div>
			</div>

			{/* Progress indicator */}
			{phase !== "idle" && phase !== "complete" && (
				<div className="mt-3 relative">
					<div className="h-1 bg-white/5 rounded-full overflow-hidden">
						<div className="h-full bg-gradient-to-r from-secondary to-secondary/60 rounded-full animate-pulse" style={{ width: `${((["detecting", "authorization", "channels", "settlements", "closing"].indexOf(phase) + 1) / 5) * 100}%` }} />
					</div>
				</div>
			)}
		</div>
	);
};

export default ProcessingStatus;
