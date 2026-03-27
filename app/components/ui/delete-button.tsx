// app/components/ui/delete-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";

interface DeleteButtonProps {
  id: number;
  resourceName: string;
  apiPath: string;
}

export function DeleteButton({ id, resourceName, apiPath }: DeleteButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await fetch(`${apiPath}/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setIsDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Delete {resourceName}?</span>
        <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleDelete}>
          Confirm
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  );
}
