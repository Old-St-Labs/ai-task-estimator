import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { projects } from "@/db/schema";

export const projectSelectSchema = createSelectSchema(projects);
export const projectInsertSchema = createInsertSchema(projects, {
  name: (s) => s.min(1, "Name is required").max(100),
  description: (s) => s.max(500).optional(),
});

export const projectUpdateSchema = projectInsertSchema.partial().omit({ createdAt: true });

export type ProjectSelect = z.infer<typeof projectSelectSchema>;
export type ProjectInsert = z.infer<typeof projectInsertSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
