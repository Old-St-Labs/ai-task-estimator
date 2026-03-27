// app/components/analysis/analyze-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";

interface AnalyzeButtonProps {
  projectId: number;
  hasStories: boolean;
  hasDevelopers: boolean;
}

export function AnalyzeButton({ projectId, hasStories, hasDevelopers }: AnalyzeButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<string | null>(null);

  const disabled = !hasStories || !hasDevelopers;

  async function handleAnalyze() {
    setIsLoading(true);
    setError(null);
    setPhase("Sending to Gemini AI…");

    try {
      const res  = await fetch(`/api/projects/${projectId}/analyze`, { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        setError(json?.data?.message ?? "Analysis failed. Please try again.");
        return;
      }

      setPhase("Done! Loading tasks…");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setIsLoading(false);
      setPhase(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleAnalyze}
        isLoading={isLoading}
        disabled={disabled}
        title={
          !hasStories ? "Add user stories first" :
          !hasDevelopers ? "Add developers first" :
          "Analyze stories with Gemini AI"
        }
      >
        ✨ Analyze & Estimate
      </Button>
      {phase && <p className="text-xs text-blue-600">{phase}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {disabled && (
        <p className="text-xs text-gray-400">
          {!hasStories ? "Add user stories first" : "Add developers first"}
        </p>
      )}
    </div>
  );
}
