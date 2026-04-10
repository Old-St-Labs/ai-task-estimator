// app/components/developers/developer-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";

const developerFormSchema = z.object({
  name:          z.string().min(1, "Name is required").max(100),
  role:          z.enum(["frontend", "backend", "fullstack", "devops", "qa"]),
  skillset:      z.string().min(1, "At least one skill is required"),
  capacityHours: z.coerce.number().min(1).max(160).default(70),
  projectId:     z.coerce.number().int().positive(),
});

type DeveloperFormValues = z.infer<typeof developerFormSchema>;

interface DeveloperFormProps {
  projectId: number;
  initialValues?: Partial<DeveloperFormValues> & { id?: number };
  onSuccess?: () => void;
}

export function DeveloperForm({ projectId, initialValues, onSuccess }: DeveloperFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialValues?.id);

  const [values, setValues] = useState<DeveloperFormValues>({
    name:          initialValues?.name          ?? "",
    role:          initialValues?.role          ?? "fullstack",
    skillset:      initialValues?.skillset      ?? "",
    capacityHours: initialValues?.capacityHours ?? 70,
    projectId,
  });
  const [errors, setErrors]       = useState<Partial<Record<keyof DeveloperFormValues, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError]   = useState<string | null>(null);

  function update<K extends keyof DeveloperFormValues>(key: K, value: DeveloperFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    const result = developerFormSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof DeveloperFormValues;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Convert comma-separated skillset to array for the API
      const payload = {
        ...result.data,
        skillset: result.data.skillset.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const url    = isEditing ? `/api/developers/${initialValues!.id}` : "/api/developers";
      const method = isEditing ? "PATCH" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

      {/* Name */}
      <div>
        <label htmlFor="dev-name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="dev-name"
          type="text"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Jane Smith"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      {/* Role */}
      <div>
        <label htmlFor="dev-role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="dev-role"
          value={values.role}
          onChange={(e) => update("role", e.target.value as DeveloperFormValues["role"])}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {(["frontend", "backend", "fullstack", "devops", "qa"] as const).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}
      </div>

      {/* Skillset */}
      <div>
        <label htmlFor="dev-skillset" className="block text-sm font-medium text-gray-700">
          Skills <span className="text-gray-400">(comma-separated)</span>
        </label>
        <input
          id="dev-skillset"
          type="text"
          value={values.skillset}
          onChange={(e) => update("skillset", e.target.value)}
          placeholder="React, TypeScript, Node.js"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.skillset && <p className="mt-1 text-xs text-red-600">{errors.skillset}</p>}
      </div>

      {/* Capacity */}
      <div>
        <label htmlFor="dev-capacity" className="block text-sm font-medium text-gray-700">
          Capacity (hours/sprint)
        </label>
        <input
          id="dev-capacity"
          type="number"
          min={1}
          max={160}
          value={values.capacityHours}
          onChange={(e) => update("capacityHours", Number(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.capacityHours && <p className="mt-1 text-xs text-red-600">{errors.capacityHours}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? "Save Changes" : "Add Developer"}
        </Button>
      </div>
    </form>
  );
}
