/**
 * db/schema.ts
 *
 * Single source of truth for all table definitions.
 * Add new tables here — drizzle-zod will derive Zod schemas automatically.
 *
 * Convention:
 *   - Table names: snake_case plural  (e.g. task_estimates)
 *   - Column names: snake_case        (e.g. created_at)
 *   - Export both the table AND its inferred TS types
 */

import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ---------------------------------------------------------------------------
// Example table — replace or extend with your own domain tables
// ---------------------------------------------------------------------------

export const taskEstimates = sqliteTable("task_estimates", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  estimatedHours: int("estimated_hours").notNull(),
  status: text("status", { enum: ["pending", "in_progress", "done"] })
    .notNull()
    .default("pending"),
  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Inferred TypeScript types
export type TaskEstimate = typeof taskEstimates.$inferSelect;
export type NewTaskEstimate = typeof taskEstimates.$inferInsert;
