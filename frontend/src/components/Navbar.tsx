import { Sparkles } from "lucide-react";

const Navbar = () => {
	return (
		<nav className="sticky top-0 z-50 glass-card mx-4 mt-4 px-6 py-4">
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Sparkles className="w-6 h-6 text-primary" />
					<span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">AI Video Factory</span>
				</div>

				<div className="hidden md:flex items-center gap-8">
					<a href="#community" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
						Community
					</a>
					<a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
						Pricing
					</a>
					<a href="#templates" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
						Templates
					</a>
				</div>

				<button className="glass-card px-6 py-2 text-sm font-semibold hover-lift">Get Started</button>
			</div>
		</nav>
	);
};

export default Navbar;
