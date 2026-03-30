import type { EstimationResult } from "@/src/domain/task";

// Re-export domain types so presentation components have a single import source
export type { Task, TaskType, TeamMember, TeamMemberRole, EstimationResult } from "@/src/domain/task";

// Presentation-layer type — belongs here, not in domain
export type ActionState =
  | { status: "idle" }
  | { status: "success"; result: EstimationResult }
  | { status: "error"; message: string };
