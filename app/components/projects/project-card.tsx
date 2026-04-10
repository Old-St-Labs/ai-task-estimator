// app/components/projects/project-card.tsx
// Server Component

import Link from "next/link";
import type { Project } from "@/db/schema";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="font-semibold text-gray-900">{project.name}</h3>
      {project.description && (
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{project.description}</p>
      )}
      <p className="mt-3 text-xs text-gray-400">
        Created {new Date(project.createdAt).toLocaleDateString()}
      </p>
    </Link>
  );
}
