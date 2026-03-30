import type { Task, TeamMember } from "./task";

export interface IEstimatorPort {
  estimate(userStories: string[], teamMembers: TeamMember[]): Promise<Task[]>;
}
