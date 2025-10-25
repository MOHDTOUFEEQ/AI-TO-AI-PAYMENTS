import { Sparkles } from "lucide-react";
import VideoRequestForm from "./VideoRequestForm";

const Hero = () => {
	return (
		<section className="max-w-5xl mx-auto px-4 py-20">
			<div className="text-center mb-12">
				<div className="mb-6 inline-flex items-center gap-2 glass-card px-4 py-2 animate-fade-in">
					<Sparkles className="w-4 h-4 text-secondary" />
					<span className="text-sm font-medium">Powered by AI Agents on Arbitrum</span>
				</div>

				<h1 className="text-6xl md:text-7xl font-bold mb-6 animate-slide-up bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent leading-tight">🎬 AI Video Factory</h1>

				<p className="text-xl md:text-2xl text-foreground/80 mb-4 max-w-2xl mx-auto font-light animate-fade-in">Generate videos with AI agents on Arbitrum</p>

				<p className="text-sm text-foreground/60 mb-12 font-light">Gas-efficient off-chain payments powered by payment channels</p>
			</div>

			<div className="animate-scale-in">
				<VideoRequestForm />
			</div>
		</section>
	);
};

export default Hero;
