// app/projects/[id]/not-found.tsx
import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-4xl">🔍</p>
      <h2 className="mt-3 text-lg font-semibold text-gray-900">Project not found</h2>
      <p className="mt-2 text-sm text-gray-600">
        The project you are looking for does not exist or has been deleted.
      </p>
      <Link href="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
        ← Back to Projects
      </Link>
    </div>
  );
}
