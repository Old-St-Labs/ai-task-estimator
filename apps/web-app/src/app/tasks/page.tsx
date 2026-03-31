'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Task, CreateTaskPayload, UpdateTaskPayload, StateStatus } from '@/types/task';
import { TaskCard } from '@/components/TaskCard';
import { TaskFormModal } from '@/components/TaskFormModal';

const ALL_STATUSES: StateStatus[] = ['IN_PROGRESS', 'COMPLETED', 'FAILED'];

export default function TasksPage() {
    const qc = useQueryClient();
    const [filter, setFilter] = useState<StateStatus | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [modalTask, setModalTask] = useState<Task | null | 'new'>(null);

    const { data: tasks = [], isLoading, error } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => api.listTasks(),
    });

    const createMut = useMutation({
        mutationFn: (payload: CreateTaskPayload) => api.createTask(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tasks'] });
            setModalTask(null);
        },
    });

    const updateMut = useMutation({
        mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) =>
            api.updateTask(taskId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tasks'] });
            setModalTask(null);
        },
    });

    async function handleSubmit(data: CreateTaskPayload | UpdateTaskPayload) {
        if (modalTask === 'new') {
            await createMut.mutateAsync(data as CreateTaskPayload);
        } else if (modalTask) {
            await updateMut.mutateAsync({ taskId: modalTask.taskEstimatorId, payload: data });
        }
    }

    const filtered = tasks.filter((t) => {
        if (filter !== 'ALL' && t.status !== filter) return false;
        if (search && !t.task.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const counts = tasks.reduce<Record<string, number>>(
        (acc, t) => ({ ...acc, [t.status]: (acc[t.status] ?? 0) + 1 }),
        {},
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1zM5.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 6.11 5.173L5.05 4.11a.75.75 0 0 1 0-1.06zM14.95 3.05a.75.75 0 0 1 0 1.06l-1.06 1.062a.75.75 0 0 1-1.062-1.061l1.061-1.061a.75.75 0 0 1 1.06 0zM3 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 3 10zM14.75 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H15.5a.75.75 0 0 1-.75-.75zM6.172 13.768a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 0 1-1.061-1.06l1.06-1.06a.75.75 0 0 1 1.061 0zm7.656 0a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06zM10 14a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 14zM6 10a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900">AI Task Estimator</h1>
                    </div>
                    <button
                        onClick={() => setModalTask('new')}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5z" />
                        </svg>
                        New Task
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
                    {[
                        { label: 'Total', value: tasks.length, color: 'bg-gray-100 text-gray-700' },
                        { label: 'In Progress', value: counts['IN_PROGRESS'] ?? 0, color: 'bg-blue-100 text-blue-700' },
                        { label: 'Completed', value: counts['COMPLETED'] ?? 0, color: 'bg-green-100 text-green-700' },
                        { label: 'Failed', value: counts['FAILED'] ?? 0, color: 'bg-red-100 text-red-700' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
                            <div className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mb-1 ${color}`}>
                                {label}
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9z" clipRule="evenodd" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search tasks…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {(['ALL', ...ALL_STATUSES] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                    filter === s
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'In Progress' : s[0] + s.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {isLoading && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
                                <div className="h-4 w-20 rounded bg-gray-200 mb-3" />
                                <div className="h-3 w-full rounded bg-gray-200 mb-2" />
                                <div className="h-3 w-2/3 rounded bg-gray-200" />
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                        <p className="text-sm font-medium text-red-700">Failed to load tasks</p>
                        <p className="text-xs text-red-500 mt-1">{(error as Error).message}</p>
                    </div>
                )}

                {!isLoading && !error && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
                        <svg className="h-12 w-12 text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">No tasks found</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {search || filter !== 'ALL' ? 'Try adjusting your filters' : 'Create your first task to get started'}
                        </p>
                        {!search && filter === 'ALL' && (
                            <button
                                onClick={() => setModalTask('new')}
                                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                            >
                                Create task
                            </button>
                        )}
                    </div>
                )}

                {!isLoading && !error && filtered.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((task) => (
                            <TaskCard
                                key={task.taskEstimatorId}
                                task={task}
                                onEdit={(t) => setModalTask(t)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {modalTask !== null && (
                <TaskFormModal
                    task={modalTask === 'new' ? undefined : modalTask}
                    onSubmit={handleSubmit}
                    onClose={() => setModalTask(null)}
                    isLoading={createMut.isPending || updateMut.isPending}
                />
            )}
        </div>
    );
}
