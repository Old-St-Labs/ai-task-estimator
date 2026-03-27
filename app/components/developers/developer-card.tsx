// app/components/developers/developer-card.tsx
// Server Component

import type { Developer } from "@/db/schema";
import { Badge } from "@/app/components/ui/badge";
import { parseSkillset } from "@/lib/skillset";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const ROLE_VARIANTS: Record<Developer["role"], BadgeVariant> = {
  frontend:  "info",
  backend:   "success",
  fullstack: "warning",
  devops:    "danger",
  qa:        "default",
};

interface DeveloperCardProps {
  developer: Developer;
  actions?: React.ReactNode;
}

export function DeveloperCard({ developer, actions }: DeveloperCardProps) {
  const skills = parseSkillset(developer.skillset);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{developer.name}</h3>
          <Badge variant={ROLE_VARIANTS[developer.role]} className="mt-1">
            {developer.role}
          </Badge>
        </div>
        <span className="text-xs text-gray-500">{developer.capacityHours}h/sprint</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {skills.map((skill) => (
          <span key={skill} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
            {skill}
          </span>
        ))}
        {skills.length === 0 && (
          <span className="text-xs italic text-gray-400">No skills listed</span>
        )}
      </div>
      {actions && <div className="mt-3 flex gap-2">{actions}</div>}
    </div>
  );
}
