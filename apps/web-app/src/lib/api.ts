import type { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types/task';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4025/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...init?.headers },
        ...init,
    });
    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`API ${init?.method ?? 'GET'} ${path} → ${res.status}: ${body}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

export const api = {
    listTasks(): Promise<Task[]> {
        return request<Task[]>('/v1/tasks/search');
    },

    getTask(taskId: string): Promise<Task> {
        return request<Task>(`/v1/tasks/${taskId}`);
    },

    createTask(payload: CreateTaskPayload): Promise<Task> {
        return request<Task>('/v1/tasks', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    updateTask(taskId: string, payload: UpdateTaskPayload): Promise<Task> {
        return request<Task>(`/v1/tasks/${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    },

    deleteTask(taskId: string): Promise<void> {
        return request<void>(`/v1/tasks/${taskId}`, { method: 'DELETE' });
    },

    completeTask(taskId: string): Promise<Task> {
        return request<Task>(`/v1/tasks/${taskId}/complete`, { method: 'POST' });
    },

    reopenTask(taskId: string): Promise<Task> {
        return request<Task>(`/v1/tasks/${taskId}/reopen`, { method: 'POST' });
    },

    estimateTask(taskId: string): Promise<Task> {
        return request<Task>(`/v1/tasks/${taskId}/estimate`, { method: 'POST' });
    },
};
