import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CommunityShowcase from "@/components/CommunityShowcase";

const Index = () => {
	return (
		<div className="min-h-screen">
			<Navbar />
			<Hero />
			<CommunityShowcase />

			<footer className="max-w-7xl mx-auto px-4 py-12 text-center border-t border-white/10 mt-20">
				<p className="text-foreground/60">© 2025 AI Video Factory. Powered by AI Agents on Arbitrum.</p>
			</footer>
		</div>
	);
};

export default Index;
