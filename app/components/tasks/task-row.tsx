// app/components/tasks/task-row.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Developer, Task } from "@/db/schema";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

const LAYER_LABELS: Record<string, string> = {
  backend:        "Backend",
  frontend:       "Frontend",
  database:       "Database",
  infrastructure: "Infra",
  testing:        "Testing",
  other:          "Other",
};

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const LAYER_BADGE_VARIANT: Record<string, BadgeVariant> = {
  backend:        "success",
  frontend:       "info",
  database:       "warning",
  infrastructure: "danger",
  testing:        "default",
  other:          "default",
};

interface TaskRowProps {
  task:       Task;
  developers: Developer[];
}

export function TaskRow({ task, developers }: TaskRowProps) {
  const router = useRouter();
  const [isEditing, setIsEditing]   = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving]     = useState(false);

type TaskLayer = "backend" | "frontend" | "database" | "infrastructure" | "testing" | "other";

  const [editValues, setEditValues] = useState({
    title:          task.title,
    estimatedHours: task.estimatedHours ?? 0,
    developerId:    task.developerId ? String(task.developerId) : "",
    layer:          (task.layer ?? "other") as TaskLayer,
  });

  const assignedDev = developers.find((d) => d.id === task.developerId);

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:          editValues.title,
          estimatedHours: Number(editValues.estimatedHours),
          developerId:    editValues.developerId ? Number(editValues.developerId) : null,
          layer:          editValues.layer,
        }),
      });
      if (res.ok) {
        router.refresh();
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        {/* Editable title */}
        <td className="px-4 py-2">
          <input
            value={editValues.title}
            onChange={(e) => setEditValues((p) => ({ ...p, title: e.target.value }))}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          />
        </td>
        {/* Layer select */}
        <td className="px-4 py-2">
          <select
            value={editValues.layer}
            onChange={(e) => setEditValues((p) => ({ ...p, layer: e.target.value as TaskLayer }))}
            className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          >
            {Object.keys(LAYER_LABELS).map((l) => (
              <option key={l} value={l}>{LAYER_LABELS[l]}</option>
            ))}
          </select>
        </td>
        {/* Estimated hours */}
        <td className="px-4 py-2">
          <input
            type="number"
            min={0.5}
            max={40}
            step={0.5}
            value={editValues.estimatedHours}
            onChange={(e) => setEditValues((p) => ({ ...p, estimatedHours: Number(e.target.value) }))}
            className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          />
        </td>
        {/* Developer reassign */}
        <td className="px-4 py-2">
          <select
            value={editValues.developerId}
            onChange={(e) => setEditValues((p) => ({ ...p, developerId: e.target.value }))}
            className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">— Unassigned —</option>
            {developers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </td>
        <td className="px-4 py-2">
          <div className="flex gap-2">
            <Button size="sm" isLoading={isSaving} onClick={handleSave}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">
        {task.isAiGenerated === 1 && (
          <span className="mr-1 text-xs text-purple-500" title="AI-generated">✨</span>
        )}
        {task.title}
        {task.description && (
          <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{task.description}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant={LAYER_BADGE_VARIANT[task.layer ?? "other"]}>
          {LAYER_LABELS[task.layer ?? "other"]}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm font-medium">
        {task.estimatedHours ?? 0}h
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {assignedDev?.name ?? (
          <span className="italic text-gray-400">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          {isDeleting ? (
            <>
              <Button size="sm" variant="danger" onClick={handleDelete}>Confirm</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsDeleting(false)}>Cancel</Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setIsDeleting(true)}>Delete</Button>
          )}
        </div>
      </td>
    </tr>
  );
}
