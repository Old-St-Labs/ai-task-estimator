// app/components/sprints/capacity-bar.tsx

interface CapacityBarProps {
  used:     number;
  capacity: number;
}

export function CapacityBar({ used, capacity }: CapacityBarProps) {
  const pct   = capacity > 0 ? Math.min(Math.round((used / capacity) * 100), 100) : 0;
  const color = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-400" : "bg-green-500";

  return (
    <div title={`${used}h used of ${capacity}h capacity (${pct}%)`}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-0.5 text-right text-xs text-gray-400">{pct}%</p>
    </div>
  );
}
