import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { developers, projects, sprints, tasks, userStories } from "@/db/schema";
import { badRequest, internalError, notFound, ok } from "@/lib/api-response";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Layer sort order — lower number = scheduled first.
 * Ensures infra/backend work lands in earlier sprints before frontend/testing.
 */
const LAYER_ORDER: Record<string, number> = {
  database:       1,
  infrastructure: 2,
  backend:        3,
  frontend:       4,
  testing:        5,
  other:          6,
};

const SPRINT_DAYS      = 14;         // 2-week sprints
const DEFAULT_CAPACITY = 80;        // fallback hours/sprint when developer has no capacityHours

// ── Route Handler ─────────────────────────────────────────────────────────────

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/projects/[id]/sprints/generate
 *
 * Capacity-packing sprint planning algorithm:
 *
 *  1. Validate project exists
 *  2. Load all tasks for the project (via user_stories subquery)
 *  3. Load developer capacity map
 *  4. Sort tasks by layer priority (database → infra → backend → frontend → testing → other)
 *  5. Greedy bin-pack: per developer, find the first sprint with enough remaining capacity
 *  6. Determine total sprint count
 *  7. Delete existing draft sprints for the project
 *  8. Insert new sprint records (1-based, 14-day windows from today)
 *  9. Bulk-update tasks.sprintNumber
 * 10. Return sprint + task summary
 */
export async function POST(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const projectId = Number(id);

    // 1. Validate project exists
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) return notFound(`Project ${projectId} not found`);

    // 2. Load all tasks for this project's stories
    //    SQLite doesn't support a JOIN shorthand here so we do a two-step fetch.
    const storyRows = await db
      .select({ id: userStories.id })
      .from(userStories)
      .where(eq(userStories.projectId, projectId));

    if (storyRows.length === 0) {
      return badRequest("No user stories found. Add stories and run 'Analyze & Estimate' first.");
    }

    const storyIds = storyRows.map((s) => s.id);

    // Load tasks whose userStoryId belongs to this project
    const allTasks = await db
      .select()
      .from(tasks)
      .where(
        sql`${tasks.userStoryId} IN (
          SELECT id FROM user_stories WHERE project_id = ${projectId}
        )`
      );

    if (allTasks.length === 0) {
      return badRequest("No tasks found. Run 'Analyze & Estimate' first.");
    }

    // 3. Build developer capacity map: developerId → capacity hours
    const devRows = await db
      .select()
      .from(developers)
      .where(eq(developers.projectId, projectId));

    const capacityMap = new Map<number, number>(
      devRows.map((d) => [d.id, d.capacityHours ?? DEFAULT_CAPACITY])
    );

    // 4. Sort tasks by layer priority (ascending = earlier layer first)
    const sortedTasks = [...allTasks].sort(
      (a, b) => (LAYER_ORDER[a.layer ?? "other"] ?? 6) - (LAYER_ORDER[b.layer ?? "other"] ?? 6)
    );

    // 5. Greedy bin-packing
    //    devBuckets[key][sprintIndex] = total hours committed in that sprint
    //    key = developerId (number) or "unassigned"
    const devBuckets = new Map<number | "unassigned", number[]>();

    // taskSprintMap: taskId → assigned sprint number (1-based)
    const taskSprintMap = new Map<number, number>();

    for (const task of sortedTasks) {
      const key      = task.developerId ?? "unassigned";
      const hours    = task.estimatedHours ?? 0;
      const capacity =
        typeof key === "number"
          ? (capacityMap.get(key) ?? DEFAULT_CAPACITY)
          : DEFAULT_CAPACITY;

      if (!devBuckets.has(key)) {
        devBuckets.set(key, [0]); // one bucket = sprint #1 starts at 0h
      }

      const buckets = devBuckets.get(key)!;

      // Find first sprint bucket with remaining room
      let placed = false;
      for (let i = 0; i < buckets.length; i++) {
        if (buckets[i] + hours <= capacity) {
          buckets[i] += hours;
          taskSprintMap.set(task.id, i + 1); // 1-based sprint number
          placed = true;
          break;
        }
      }

      if (!placed) {
        // All existing buckets are full — open a new sprint
        buckets.push(hours);
        taskSprintMap.set(task.id, buckets.length);
      }
    }

    // 6. Total sprint count = max bucket index across all developers
    let maxSprint = 0;
    for (const buckets of devBuckets.values()) {
      if (buckets.length > maxSprint) maxSprint = buckets.length;
    }

    // 7. Delete existing draft sprints for this project
    await db.delete(sprints).where(eq(sprints.projectId, projectId));

    // 8. Insert new sprint records
    const sprintBase = new Date();
    sprintBase.setHours(0, 0, 0, 0); // normalise to midnight

    const createdSprints = [];
    for (let i = 1; i <= maxSprint; i++) {
      const startDate = new Date(sprintBase.getTime() + (i - 1) * SPRINT_DAYS * 86_400_000);
      const endDate   = new Date(startDate.getTime() + SPRINT_DAYS * 86_400_000);

      // Sum hours for all tasks assigned to this sprint number
      const sprintTotalHours = [...taskSprintMap.entries()]
        .filter(([, sprintNum]) => sprintNum === i)
        .reduce((sum, [taskId]) => {
          const t = allTasks.find((r) => r.id === taskId);
          return sum + (t?.estimatedHours ?? 0);
        }, 0);

      const [sprint] = await db
        .insert(sprints)
        .values({
          projectId,
          sprintNumber: i,
          startDate,
          endDate,
          status: "draft",
          totalHours: sprintTotalHours,
        })
        .returning();

      createdSprints.push(sprint);
    }

    // 9. Bulk-update tasks with their assigned sprint number
    for (const [taskId, sprintNum] of taskSprintMap.entries()) {
      await db
        .update(tasks)
        .set({ sprintNumber: sprintNum, updatedAt: new Date() })
        .where(eq(tasks.id, taskId));
    }

    // 10. Return summary
    const unassignedCount = [...taskSprintMap.keys()].filter(
      (taskId) => allTasks.find((t) => t.id === taskId)?.developerId == null
    ).length;

    return ok({
      sprintCount:      maxSprint,
      taskCount:        taskSprintMap.size,
      unassignedCount,
      sprints:          createdSprints,
    });
  } catch (err) {
    console.error("[sprints/generate] error:", err);
    return internalError();
  }
}
