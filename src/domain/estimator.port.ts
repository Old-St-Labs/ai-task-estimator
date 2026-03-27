import type { Task } from "./task";

export interface IEstimatorPort {
  estimate(userStories: string[], teamMembers: string[]): Promise<Task[]>;
}
