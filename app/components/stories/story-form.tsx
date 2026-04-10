// app/components/stories/story-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";

const storyFormSchema = z.object({
  title:              z.string().min(1, "Title is required").max(200),
  description:        z.string().min(1, "Description is required"),
  acceptanceCriteria: z.string().optional(),
  priority:           z.enum(["low", "medium", "high", "critical"]),
  projectId:          z.coerce.number().int().positive(),
});

type StoryFormValues = z.infer<typeof storyFormSchema>;

interface StoryFormProps {
  projectId: number;
  initialValues?: Partial<StoryFormValues> & { id?: number };
  onSuccess?: () => void;
}

export function StoryForm({ projectId, initialValues, onSuccess }: StoryFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialValues?.id);

  const [values, setValues] = useState<StoryFormValues>({
    title:              initialValues?.title              ?? "",
    description:        initialValues?.description        ?? "",
    acceptanceCriteria: initialValues?.acceptanceCriteria ?? "",
    priority:           initialValues?.priority           ?? "medium",
    projectId,
  });
  const [errors, setErrors]       = useState<Partial<Record<keyof StoryFormValues, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError]   = useState<string | null>(null);

  function update<K extends keyof StoryFormValues>(key: K, value: StoryFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    const result = storyFormSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof StoryFormValues;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const url    = isEditing ? `/api/user-stories/${initialValues!.id}` : "/api/user-stories";
      const method = isEditing ? "PATCH" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const json = await res.json();

      if (!res.ok) {
        setApiError(json?.data?.message ?? "An error occurred");
        return;
      }

      router.refresh();
      onSuccess?.();
    } catch {
      setApiError("Network error — please try again");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{apiError}</div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="story-title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="story-title"
          type="text"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="As a user, I want to..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>

      {/* Priority */}
      <div>
        <label htmlFor="story-priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          id="story-priority"
          value={values.priority}
          onChange={(e) => update("priority", e.target.value as StoryFormValues["priority"])}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {(["low", "medium", "high", "critical"] as const).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="story-desc" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="story-desc"
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          placeholder="Detailed description of the feature..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
      </div>

      {/* Acceptance Criteria */}
      <div>
        <label htmlFor="story-ac" className="block text-sm font-medium text-gray-700">
          Acceptance Criteria <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="story-ac"
          value={values.acceptanceCriteria ?? ""}
          onChange={(e) => update("acceptanceCriteria", e.target.value)}
          rows={3}
          placeholder="Given... When... Then..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? "Save Changes" : "Add Story"}
        </Button>
      </div>
    </form>
  );
}
