// app/projects/[id]/stories/page.tsx
// Server Component — user story backlog

import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { projects, userStories } from "@/db/schema";
import { StoryListItem } from "@/app/components/stories/story-list-item";
import { StoryForm } from "@/app/components/stories/story-form";
import { Modal } from "@/app/components/ui/modal";
import { Button } from "@/app/components/ui/button";
import { DeleteButton } from "@/app/components/ui/delete-button";

export const metadata = { title: "User Stories — AI Task Estimator" };

export default async function StoriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [project] = await db.select().from(projects).where(eq(projects.id, Number(id)));
  if (!project) notFound();

  const stories = await db
    .select()
    .from(userStories)
    .where(eq(userStories.projectId, project.id))
    .orderBy(userStories.createdAt);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Projects</Link>
        <span className="mx-2">/</span>
        <Link href={`/projects/${id}`} className="hover:text-gray-700">{project.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">User Stories</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Stories</h1>
          <p className="mt-1 text-sm text-gray-500">
            {stories.length} {stories.length !== 1 ? "stories" : "story"} — describe the features you want to build
          </p>
        </div>
        <Modal title="Add User Story" trigger={<Button>+ Add Story</Button>}>
          <StoryForm projectId={project.id} />
        </Modal>
      </div>

      {stories.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-4xl">📝</p>
          <h2 className="mt-3 text-lg font-semibold text-gray-900">No user stories yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Add at least one story to run the AI analysis and generate tasks.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {stories.map((story) => (
            <StoryListItem
              key={story.id}
              story={story}
              actions={
                <>
                  <Modal
                    title="Edit Story"
                    trigger={<Button variant="secondary" size="sm">Edit</Button>}
                  >
                    <StoryForm
                      projectId={project.id}
                      initialValues={{
                        id:                 story.id,
                        title:              story.title,
                        description:        story.description,
                        acceptanceCriteria: story.acceptanceCriteria ?? "",
                        priority:           story.priority,
                      }}
                    />
                  </Modal>
                  <DeleteButton
                    id={story.id}
                    resourceName="story"
                    apiPath="/api/user-stories"
                  />
                </>
              }
            />
          ))}
        </div>
      )}

      {/* Continue button */}
      {stories.length > 0 && (
        <div className="mt-8 flex justify-end">
          <Link href={`/projects/${id}/tasks`}>
            <Button>Analyze & Estimate Tasks →</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
