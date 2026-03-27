// app/components/analysis/gap-list.tsx
// Server Component — shows AI-identified gaps

interface GapListProps {
  gaps: string[];
}

export function GapList({ gaps }: GapListProps) {
  if (gaps.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <h3 className="flex items-center gap-1.5 font-semibold text-yellow-800">
        <span>⚠️</span> Requirement Gaps Identified
      </h3>
      <p className="mt-1 text-sm text-yellow-700">
        The AI found {gaps.length} implicit requirement{gaps.length !== 1 ? "s" : ""} not explicitly mentioned in the stories:
      </p>
      <ul className="mt-3 space-y-1">
        {gaps.map((gap, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-yellow-800">
            <span className="mt-0.5 text-yellow-500">•</span>
            {gap}
          </li>
        ))}
      </ul>
    </div>
  );
}
