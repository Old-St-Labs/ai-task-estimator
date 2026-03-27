// app/projects/[id]/sprints/page.tsx
// Server Component — sprint board visualization

import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { projects, sprints, tasks, developers, userStories } from "@/db/schema";
import { SprintBoard } from "@/app/components/sprints/sprint-board";
import { SprintStats } from "@/app/components/sprints/sprint-stats";
import { GenerateSprintsButton } from "@/app/components/sprints/generate-sprints-button";

export const metadata = { title: "Sprint Plan — AI Task Estimator" };

export default async function SprintsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [project] = await db.select().from(projects).where(eq(projects.id, Number(id)));
  if (!project) notFound();

  const [sprintRows, devRows, storyRows, allTasks] = await Promise.all([
    db.select().from(sprints).where(eq(sprints.projectId, project.id)),
    db.select().from(developers).where(eq(developers.projectId, project.id)),
    db.select().from(userStories).where(eq(userStories.projectId, project.id)),
    db.select().from(tasks),
  ]);

  // Only tasks belonging to this project's stories
  const storyIds     = new Set(storyRows.map((s) => s.id));
  const projectTasks = allTasks.filter((t) => storyIds.has(t.userStoryId));

  return (
    <div className="mx-auto max-w-full px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Projects</Link>
        <span className="mx-2">/</span>
        <Link href={`/projects/${id}`} className="hover:text-gray-700">{project.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Sprint Plan</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sprint Plan</h1>
          <p className="mt-1 text-sm text-gray-500">{project.name}</p>
        </div>
        <GenerateSprintsButton projectId={project.id} />
      </div>

      {/* Pre-requisites warning */}
      {projectTasks.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-4xl">🗓️</p>
          <h2 className="mt-3 text-lg font-semibold text-gray-900">No tasks to plan yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            First analyze your stories to generate tasks, then come back to generate sprints.
          </p>
          <Link
            href={`/projects/${id}/tasks`}
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            ← Go to Tasks
          </Link>
        </div>
      )}

      {/* Stats + board */}
      {projectTasks.length > 0 && (
        <>
          <SprintStats
            sprints={sprintRows}
            tasks={projectTasks}
            developers={devRows}
          />

          {sprintRows.length === 0 ? (
            <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="text-gray-500">
                Click &quot;Generate Sprints&quot; to pack your {projectTasks.length} tasks into 2-week sprints.
              </p>
            </div>
          ) : (
            <SprintBoard
              sprints={sprintRows}
              tasks={projectTasks}
              developers={devRows}
              stories={storyRows}
            />
          )}
        </>
      )}
    </div>
  );
}
