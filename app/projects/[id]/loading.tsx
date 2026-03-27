// app/projects/[id]/loading.tsx
export default function ProjectLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-8">
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="mt-6 h-9 w-64 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-96 rounded bg-gray-200" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl border bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
