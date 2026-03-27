export type TaskType = "FE" | "BE";

export type Task = {
  title: string;
  description: string;
  type: TaskType;
  estimatedHours: number;
  assignedTo: string;
  userStory: string;
};

export type EstimationResult = {
  tasks: Task[];
  summary: {
    totalHours: number;
    byMember: Record<string, number>;
  };
};

export type ActionState =
  | { status: "idle" }
  | { status: "success"; result: EstimationResult }
  | { status: "error"; message: string };
