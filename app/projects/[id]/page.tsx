// app/projects/[id]/page.tsx
// Server Component — project overview with navigation to sub-sections

import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { projects, developers, userStories, tasks, sprints } from "@/db/schema";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.id, Number(id)));
  return { title: project ? `${project.name} — AI Task Estimator` : "Project" };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [project] = await db.select().from(projects).where(eq(projects.id, Number(id)));
  if (!project) notFound();

  const [devRows, storyRows, sprintRows] = await Promise.all([
    db.select().from(developers).where(eq(developers.projectId, project.id)),
    db.select().from(userStories).where(eq(userStories.projectId, project.id)),
    db.select().from(sprints).where(eq(sprints.projectId, project.id)),
  ]);

  // Count tasks for this project's stories
  const storyIds = storyRows.map((s) => s.id);
  const taskCount =
    storyIds.length > 0
      ? (await db.select().from(tasks)).filter((t) => storyIds.includes(t.userStoryId)).length
      : 0;

  const stats = [
    { label: "Developers", value: devRows.length, href: `/projects/${id}/developers`, icon: "👥" },
    { label: "User Stories", value: storyRows.length, href: `/projects/${id}/stories`, icon: "📝" },
    { label: "Tasks", value: taskCount, href: `/projects/${id}/tasks`, icon: "✅" },
    { label: "Sprints", value: sprintRows.length, href: `/projects/${id}/sprints`, icon: "🗓️" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Projects</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="mt-2 text-gray-500">{project.description}</p>
          )}
        </div>
      </div>

      {/* Navigation cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, href, icon }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-2xl">{icon}</span>
            <span className="mt-3 text-3xl font-bold text-gray-900">{value}</span>
            <span className="mt-1 text-sm text-gray-500 group-hover:text-blue-600">{label} →</span>
          </Link>
        ))}
      </div>

      {/* Workflow steps */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Workflow</h2>
        <ol className="mt-4 space-y-3">
          {[
            { step: 1, label: "Add your team", desc: "Add developers with their roles and skills.", href: `/projects/${id}/developers` },
            { step: 2, label: "Enter user stories", desc: "Describe the features you want to build.", href: `/projects/${id}/stories` },
            { step: 3, label: "Analyze & estimate", desc: "Let AI break down stories into granular tasks.", href: `/projects/${id}/tasks` },
            { step: 4, label: "Generate sprints", desc: "Pack tasks into 2-week sprints automatically.", href: `/projects/${id}/sprints` },
          ].map(({ step, label, desc, href }) => (
            <li key={step}>
              <Link
                href={href}
                className="flex items-center gap-4 rounded-lg border border-gray-100 bg-white px-5 py-3 hover:border-blue-300 hover:bg-blue-50"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {step}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
                <span className="ml-auto text-gray-400">→</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
