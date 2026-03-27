import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { sprints } from "@/db/schema";

export const sprintSelectSchema = createSelectSchema(sprints);
export const sprintInsertSchema = createInsertSchema(sprints, {
  sprintNumber: (s) => s.min(1),
  totalHours: (s) => s.min(0).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const sprintUpdateSchema = sprintInsertSchema.partial();

export type SprintSelect = z.infer<typeof sprintSelectSchema>;
export type SprintInsert = z.infer<typeof sprintInsertSchema>;
export type SprintUpdate = z.infer<typeof sprintUpdateSchema>;

