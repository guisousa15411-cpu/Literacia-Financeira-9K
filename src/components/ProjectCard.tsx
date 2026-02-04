import { Calendar, Users } from "lucide-react";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
  memberCount?: number;
  onClick?: () => void;
}

export const ProjectCard = ({
  id,
  name,
  description,
  icon,
  color,
  createdAt,
  memberCount = 1,
  onClick,
}: ProjectCardProps) => {
  const date = new Date(createdAt).toLocaleDateString();

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded bg-${color}-100 text-${color}-700`}>
          Active
        </span>
      </div>
      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
        {name}
      </h3>
      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{description}</p>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {date}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {memberCount} member{memberCount !== 1 ? "s" : ""}
        </span>
      </div>
    </button>
  );
};
