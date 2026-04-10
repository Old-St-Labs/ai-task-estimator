// app/components/projects/project-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";

const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  initialValues?: Partial<ProjectFormValues> & { id?: number };
  onSuccess?: () => void;
}

export function ProjectForm({ initialValues, onSuccess }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialValues?.id);

  const [values, setValues] = useState<ProjectFormValues>({
    name: initialValues?.name ?? "",
    description: initialValues?.description ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormValues, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function update<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    const result = projectFormSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ProjectFormValues;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditing ? `/api/projects/${initialValues!.id}` : "/api/projects";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
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

      if (!isEditing) {
        // Navigate to the new project
        router.push(`/projects/${json.data.id}`);
      }
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

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          id="name"
          type="text"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="My Awesome Project"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="description"
          value={values.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          placeholder="Brief description of what you're building..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? "Save Changes" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
