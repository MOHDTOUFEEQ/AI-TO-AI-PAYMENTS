import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import VideoRequestForm from "./VideoRequestForm";
import TerminalLogs from "./TerminalLogs";
import PaymentChannelInfo from "./PaymentChannelInfo";
import ProcessingStatus from "./ProcessingStatus";
import VideoPopup from "./VideoPopup";
import { Button } from "./ui/button";

const Hero = () => {
	const [videoPopupOpen, setVideoPopupOpen] = useState(false);
	const [videoUrl, setVideoUrl] = useState<string | null>(null);
	const [requestId, setRequestId] = useState<string | undefined>(undefined);
	const [scriptText, setScriptText] = useState<string | undefined>(undefined);

	useEffect(() => {
		// Listen for video completion events from orchestrator
		const orchestratorUrl = import.meta.env.VITE_ORCHESTRATOR_URL || "http://localhost:3001";
		const eventSource = new EventSource(`${orchestratorUrl}/api/logs/stream`);

		eventSource.onmessage = (event) => {
			try {
				const log = JSON.parse(event.data);
				const message = log.message || "";

				// Check if the message contains video completion info
				if (message.includes("✅ Video Generation Complete!") || message.includes("Video URL:")) {
					// Extract video URL from the next log message
					const urlMatch = message.match(/Video URL:\s*(https?:\/\/[^\s]+)/);
					if (urlMatch) {
						setVideoUrl(urlMatch[1]);
					}
				}

				// Extract request ID if available
				if (message.includes("Request ID:")) {
					const idMatch = message.match(/Request ID:\s*(\d+)/);
					if (idMatch) {
						setRequestId(idMatch[1]);
					}
				}

				// Extract script if available
				if (message.includes("✅ Script Generated")) {
					// You can enhance this to actually extract the script text
					// For now, we'll leave it as a placeholder
				}

				// Open popup when complete
				if (message.includes("COMPLETE PAYMENT CHANNEL FLOW FINISHED") || message.includes("FULLY COMPLETED")) {
					if (videoUrl) {
						setVideoPopupOpen(true);
					}
				}
			} catch (error) {
				// Ignore parsing errors
			}
		};

		return () => {
			eventSource.close();
		};
	}, [videoUrl]);

	return (
		<section className="max-w-7xl mx-auto px-4 py-10">
			<div className="text-center mb-12 h-screen">
				<div className="mb-6 inline-flex items-center gap-2 glass-card px-4 py-2 animate-fade-in">
					<Sparkles className="w-4 h-4 text-secondary" />
					<span className="text-sm font-medium">Powered by AI Agents on Arbitrum</span>
				</div>

				<h1 className="text-6xl md:text-7xl font-bold mb-6 animate-slide-up bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent leading-tight">🎬 AI Video Factory</h1>

				<p className="text-xl md:text-2xl text-foreground/80 mb-4 max-w-2xl mx-auto font-light animate-fade-in">Generate videos with AI agents on Arbitrum</p>

				<p className="text-sm text-foreground/60 mb-12 font-light">Gas-efficient off-chain payments powered by payment channels</p>
				<PaymentChannelInfo />

				<Button
					onClick={() => {
						const formContainer = document.getElementById("form-container");
						if (formContainer) {
							const navbarHeight = 120; // Approximate navbar + margin height
							const elementPosition = formContainer.getBoundingClientRect().top + window.pageYOffset;
							const offsetPosition = elementPosition - navbarHeight;

							window.scrollTo({
								top: offsetPosition,
								behavior: "smooth",
							});
						}
					}}
				>
					Try it now
				</Button>
			</div>

			{/* Two Column Layout: Form + Terminal */}
			<div id="form-container" className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-scale-in scroll-mt-32">
				{/* Left: Video Request Form */}
				<div className="flex flex-col gap-6 glass-card p-6 min-h-[600px]">
					<ProcessingStatus />
					<VideoRequestForm />
				</div>

				{/* Right: Terminal Logs */}
				<div className="lg:sticky lg:top-24 h-fit">
					<TerminalLogs />
				</div>
			</div>

			{/* Video Popup */}
			<VideoPopup isOpen={videoPopupOpen} onClose={() => setVideoPopupOpen(false)} videoUrl={videoUrl} requestId={requestId} scriptText={scriptText} />
		</section>
	);
};

export default Hero;
