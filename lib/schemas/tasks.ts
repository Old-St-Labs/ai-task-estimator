import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tasks } from "@/db/schema";

export const taskSelectSchema = createSelectSchema(tasks);
export const taskInsertSchema = createInsertSchema(tasks, {
  title: (s) => s.min(1, "Title is required").max(200),
  estimatedHours: (s) => s.min(0).max(200).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const taskUpdateSchema = taskInsertSchema.partial();

export type TaskSelect = z.infer<typeof taskSelectSchema>;
export type TaskInsert = z.infer<typeof taskInsertSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;
