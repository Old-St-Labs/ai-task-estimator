// app/components/sprints/generate-sprints-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";

interface GenerateSprintsButtonProps {
  projectId: number;
}

export function GenerateSprintsButton({ projectId }: GenerateSprintsButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/projects/${projectId}/sprints/generate`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.data?.message ?? "Failed to generate sprints.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={handleGenerate} isLoading={isLoading}>
        🗓️ Generate Sprints
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
