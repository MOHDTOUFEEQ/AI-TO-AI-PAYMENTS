import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPopupProps {
	isOpen: boolean;
	onClose: () => void;
	videoUrl: string | null;
	requestId?: string;
	scriptText?: string;
}

const VideoPopup = ({ isOpen, onClose, videoUrl, requestId, scriptText }: VideoPopupProps) => {
	const handleDownload = async () => {
		if (!videoUrl) return;

		try {
			const response = await fetch(videoUrl);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `video-${requestId || Date.now()}.mp4`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error("Download failed:", error);
		}
	};

	const handleOpenInNewTab = () => {
		if (videoUrl) {
			window.open(videoUrl, "_blank");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl w-full bg-background border border-white/10 shadow-2xl">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold flex items-center justify-between">
						<span className="bg-gradient-to-r from-secondary to-secondary/60 bg-clip-text text-transparent">🎬 Your AI-Generated Video</span>
						<Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/5">
							<X className="w-5 h-5" />
						</Button>
					</DialogTitle>
					{requestId && <DialogDescription className="text-foreground/60">Request ID: {requestId}</DialogDescription>}
				</DialogHeader>

				<div className="space-y-6">
					{/* Video Player */}
					<div className="relative rounded-xl overflow-hidden bg-black/50 aspect-video">
						{videoUrl ? (
							<video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain">
								Your browser does not support the video tag.
							</video>
						) : (
							<div className="flex items-center justify-center h-full">
								<div className="text-center">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
									<p className="text-foreground/60">Loading video...</p>
								</div>
							</div>
						)}
					</div>

					{/* Script Text (if available) */}
					{scriptText && (
						<div className="glass-card p-4 border border-white/10">
							<h3 className="text-sm font-semibold mb-2 text-foreground/80">Generated Script:</h3>
							<p className="text-sm text-foreground/70 whitespace-pre-wrap">{scriptText}</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex gap-3 justify-end">
						<Button variant="outline" onClick={handleOpenInNewTab} disabled={!videoUrl} className="border-white/10 hover:bg-white/5">
							<ExternalLink className="w-4 h-4 mr-2" />
							Open in New Tab
						</Button>
						<Button onClick={handleDownload} disabled={!videoUrl} className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70">
							<Download className="w-4 h-4 mr-2" />
							Download Video
						</Button>
					</div>

					{/* Payment Channel Info */}
					<div className="glass-card p-4 border border-white/10">
						<h3 className="text-sm font-semibold mb-2 text-foreground/80">⚡ Payment Channel Flow:</h3>
						<div className="space-y-1 text-xs text-foreground/60">
							<p>✅ Channels opened (1 on-chain TX)</p>
							<p>✅ Agents paid via off-chain signatures (0 gas!)</p>
							<p>✅ Funds distributed: Script (30%) • Image (30%) • Video (40%)</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default VideoPopup;
