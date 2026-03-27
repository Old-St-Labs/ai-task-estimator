// app/projects/[id]/developers/page.tsx
// Server Component — developer roster for a project

import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { projects, developers } from "@/db/schema";
import { DeveloperCard } from "@/app/components/developers/developer-card";
import { DeveloperForm } from "@/app/components/developers/developer-form";
import { Modal } from "@/app/components/ui/modal";
import { Button } from "@/app/components/ui/button";
import { DeleteButton } from "@/app/components/ui/delete-button";

export const metadata = { title: "Team Roster — AI Task Estimator" };

export default async function DevelopersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [project] = await db.select().from(projects).where(eq(projects.id, Number(id)));
  if (!project) notFound();

  const devRoster = await db.select().from(developers).where(eq(developers.projectId, project.id));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Projects</Link>
        <span className="mx-2">/</span>
        <Link href={`/projects/${id}`} className="hover:text-gray-700">{project.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Team</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Roster</h1>
          <p className="mt-1 text-sm text-gray-500">
            {devRoster.length} developer{devRoster.length !== 1 ? "s" : ""} — used for AI task assignment
          </p>
        </div>
        <Modal title="Add Developer" trigger={<Button>+ Add Developer</Button>}>
          <DeveloperForm projectId={project.id} />
        </Modal>
      </div>

      {devRoster.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-4xl">👥</p>
          <h2 className="mt-3 text-lg font-semibold text-gray-900">No developers yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Add team members so the AI can assign tasks based on their skills.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devRoster.map((dev) => (
            <DeveloperCard
              key={dev.id}
              developer={dev}
              actions={
                <>
                  <Modal
                    title="Edit Developer"
                    trigger={
                      <Button variant="secondary" size="sm">Edit</Button>
                    }
                  >
                    <DeveloperForm
                      projectId={project.id}
                      initialValues={{
                        id:            dev.id,
                        name:          dev.name,
                        role:          dev.role,
                        skillset:      JSON.parse(dev.skillset ?? "[]").join(", "),
                        capacityHours: dev.capacityHours,
                      }}
                    />
                  </Modal>
                  <DeleteButton id={dev.id} resourceName={dev.name} apiPath="/api/developers" />
                </>
              }
            />
          ))}
        </div>
      )}

      {/* Continue button */}
      {devRoster.length > 0 && (
        <div className="mt-8 flex justify-end">
          <Link href={`/projects/${id}/stories`}>
            <Button>Continue to User Stories →</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
