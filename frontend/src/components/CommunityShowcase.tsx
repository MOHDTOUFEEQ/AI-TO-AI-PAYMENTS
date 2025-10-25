import ProjectCard from "./ProjectCard";

const projects = [
  {
    id: 1,
    title: "AI Art Generator",
    author: "Sarah Chen",
    likes: 2847,
    views: 12453,
    image: "🎨",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: 2,
    title: "Smart Code Assistant",
    author: "Alex Kumar",
    likes: 1923,
    views: 8742,
    image: "💻",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: 3,
    title: "Voice Clone Studio",
    author: "Emma Wilson",
    likes: 3521,
    views: 15632,
    image: "🎤",
    gradient: "from-orange-500 to-red-500"
  },
  {
    id: 4,
    title: "Neural Music Composer",
    author: "James Park",
    likes: 2156,
    views: 9834,
    image: "🎵",
    gradient: "from-green-500 to-teal-500"
  },
  {
    id: 5,
    title: "3D Model Generator",
    author: "Sofia Martinez",
    likes: 4012,
    views: 18234,
    image: "🎭",
    gradient: "from-pink-500 to-purple-500"
  },
  {
    id: 6,
    title: "AI Video Editor",
    author: "Michael Lee",
    likes: 2789,
    views: 11567,
    image: "🎬",
    gradient: "from-indigo-500 to-blue-500"
  }
];

const CommunityShowcase = () => {
  return (
    <section id="community" className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Community Creations
        </h2>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
          Explore amazing projects built by our creative community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </section>
  );
};

export default CommunityShowcase;
