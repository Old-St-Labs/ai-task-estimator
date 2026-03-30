export type TaskType = "FE" | "BE";

export type TeamMemberRole = "FE" | "BE" | "Fullstack";

export type TeamMember = {
  name: string;
  role: TeamMemberRole;
};

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
