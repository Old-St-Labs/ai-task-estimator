// app/projects/[id]/tasks/page.tsx
// Server Component — review AI-generated tasks with manual override

import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { projects, developers, userStories, tasks } from "@/db/schema";
import { TaskTable } from "@/app/components/tasks/task-table";
import { AnalyzeButton } from "@/app/components/analysis/analyze-button";

export const metadata = { title: "Tasks — AI Task Estimator" };

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [project] = await db.select().from(projects).where(eq(projects.id, Number(id)));
  if (!project) notFound();

  const [devRows, storyRows] = await Promise.all([
    db.select().from(developers).where(eq(developers.projectId, project.id)),
    db.select().from(userStories).where(eq(userStories.projectId, project.id)),
  ]);

  // Fetch tasks for all stories in this project
  const storyIds = storyRows.map((s) => s.id);
  const taskRows =
    storyIds.length > 0
      ? (await db.select().from(tasks)).filter((t) => storyIds.includes(t.userStoryId))
      : [];

  const totalHours = taskRows.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);
  const aiTaskCount = taskRows.filter((t) => t.isAiGenerated === 1).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Projects</Link>
        <span className="mx-2">/</span>
        <Link href={`/projects/${id}`} className="hover:text-gray-700">{project.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Tasks</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          {taskRows.length > 0 ? (
            <p className="mt-1 text-sm text-gray-500">
              {taskRows.length} tasks · {totalHours}h total
              {aiTaskCount > 0 && (
                <span className="ml-2 text-purple-600">✨ {aiTaskCount} AI-generated</span>
              )}
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              Click &quot;Analyze &amp; Estimate&quot; to generate tasks from your stories.
            </p>
          )}
        </div>
        <AnalyzeButton
          projectId={project.id}
          hasStories={storyRows.length > 0}
          hasDevelopers={devRows.length > 0}
        />
      </div>

      {/* Empty states */}
      {storyRows.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-4xl">📝</p>
          <h2 className="mt-3 text-lg font-semibold text-gray-900">No user stories yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Add stories first, then analyze them to generate tasks.
          </p>
          <Link
            href={`/projects/${id}/stories`}
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Add User Stories →
          </Link>
        </div>
      )}

      {storyRows.length > 0 && devRows.length === 0 && (
        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          ⚠️ Add developers before analyzing — the AI needs your team roster to assign tasks.{" "}
          <Link href={`/projects/${id}/developers`} className="underline hover:text-yellow-900">
            Add developers
          </Link>
        </div>
      )}

      {/* Task tables grouped by story */}
      {taskRows.length > 0 && (
        <div className="mt-6">
          {storyRows.map((story) => {
            const storyTasks = taskRows
              .filter((t) => t.userStoryId === story.id)
              .sort((a, b) => {
                const layerOrder: Record<string, number> = {
                  database: 1, infrastructure: 2, backend: 3,
                  frontend: 4, testing: 5, other: 6,
                };
                return (layerOrder[a.layer ?? "other"] ?? 6) - (layerOrder[b.layer ?? "other"] ?? 6);
              });

            return (
              <TaskTable
                key={story.id}
                story={story}
                tasks={storyTasks}
                developers={devRows}
              />
            );
          })}
        </div>
      )}

      {/* Continue button */}
      {taskRows.length > 0 && (
        <div className="mt-8 flex justify-end">
          <Link href={`/projects/${id}/sprints`}>
            <button className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Generate Sprints →
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
