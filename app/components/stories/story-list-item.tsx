// app/components/stories/story-list-item.tsx
// Server Component

import type { UserStory } from "@/db/schema";
import { Badge } from "@/app/components/ui/badge";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const PRIORITY_VARIANTS: Record<UserStory["priority"], BadgeVariant> = {
  low:      "default",
  medium:   "info",
  high:     "warning",
  critical: "danger",
};

interface StoryListItemProps {
  story:   UserStory;
  actions: React.ReactNode;
}

export function StoryListItem({ story, actions }: StoryListItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant={PRIORITY_VARIANTS[story.priority]}>{story.priority}</Badge>
          </div>
          <h3 className="mt-1 font-semibold text-gray-900">{story.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">{story.description}</p>
          {story.acceptanceCriteria && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">
                Acceptance criteria
              </summary>
              <p className="mt-1 whitespace-pre-line text-xs text-gray-500">
                {story.acceptanceCriteria}
              </p>
            </details>
          )}
        </div>
        <div className="flex shrink-0 gap-2">{actions}</div>
      </div>
    </div>
  );
}
