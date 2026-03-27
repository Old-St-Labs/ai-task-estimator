// app/page.tsx
// Server Component — lists all projects and allows creating a new one

import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ProjectCard } from "@/app/components/projects/project-card";
import { Modal } from "@/app/components/ui/modal";
import { Button } from "@/app/components/ui/button";
import { ProjectForm } from "@/app/components/projects/project-form";

export const metadata = {
  title: "Projects — AI Task Estimator",
};

export default async function HomePage() {
  const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Each project holds your team, user stories, and sprint plan.
          </p>
        </div>
        <Modal title="New Project" trigger={<Button>+ New Project</Button>}>
          <ProjectForm />
        </Modal>
      </div>

      {allProjects.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-4xl">📁</p>
          <h2 className="mt-3 text-lg font-semibold text-gray-900">No projects yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create your first project to get started with AI-powered sprint planning.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

