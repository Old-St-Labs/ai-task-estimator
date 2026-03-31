export type StateStatus = 'FAILED' | 'COMPLETED' | 'IN_PROGRESS';

export interface Task {
    taskEstimatorId: string;
    task: string;
    estimatedHours: number;
    status: StateStatus;
    AIResponse?: string;
}

export interface CreateTaskPayload {
    task: string;
}

export interface UpdateTaskPayload {
    task?: string;
    estimatedHours?: number;
    status?: StateStatus;
}
