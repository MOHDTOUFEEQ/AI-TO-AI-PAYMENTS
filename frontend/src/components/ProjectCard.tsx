import { User, Heart, Eye } from "lucide-react";

interface ProjectCardProps {
	title: string;
	author: string;
	likes: number;
	views: number;
	image: string;
	gradient: string;
}

const ProjectCard = ({ title, author, likes, views, image, gradient }: ProjectCardProps) => {
	return (
		<div className="glass-card overflow-hidden hover-lift cursor-pointer group">
			<div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
				<div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
				<span className="text-6xl group-hover:scale-110 transition-transform duration-500">{image}</span>
			</div>

			<div className="p-5">
				<h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors">{title}</h3>

				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-2">
						<div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
							<User className="w-3 h-3" />
						</div>
						<span className="text-foreground/70 font-medium">{author}</span>
					</div>

					<div className="flex items-center gap-3 text-foreground/60">
						<div className="flex items-center gap-1">
							<Heart className="w-4 h-4" />
							<span>{likes}</span>
						</div>
						<div className="flex items-center gap-1">
							<Eye className="w-4 h-4" />
							<span>{views}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProjectCard;
