import type { IEstimatorPort } from "../domain/estimator.port";
import type { EstimationResult } from "../domain/task";

export async function estimateTasksUseCase(
  port: IEstimatorPort,
  userStories: string[],
  teamMembers: string[]
): Promise<EstimationResult> {
  const tasks = await port.estimate(userStories, teamMembers);

  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const byMember: Record<string, number> = {};
  for (const task of tasks) {
    byMember[task.assignedTo] = (byMember[task.assignedTo] ?? 0) + task.estimatedHours;
  }

  return { tasks, summary: { totalHours, byMember } };
}
