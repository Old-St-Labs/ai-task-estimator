'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Task } from '@/types/task';

const STATUS_STYLES: Record<string, string> = {
    IN_PROGRESS: 'bg-blue-100 text-blue-700 ring-blue-200',
    COMPLETED: 'bg-green-100 text-green-700 ring-green-200',
    FAILED: 'bg-red-100 text-red-700 ring-red-200',
};

const STATUS_LABEL: Record<string, string> = {
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
};

interface Props {
    task: Task;
    onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: Props) {
    const qc = useQueryClient();
    const [estimating, setEstimating] = useState(false);
    const [hoursInput, setHoursInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks'] });

    const deleteMut = useMutation({ mutationFn: () => api.deleteTask(task.taskEstimatorId), onSuccess: invalidate });
    const completeMut = useMutation({ mutationFn: () => api.completeTask(task.taskEstimatorId), onSuccess: invalidate });
    const reopenMut = useMutation({ mutationFn: () => api.reopenTask(task.taskEstimatorId), onSuccess: invalidate });
    const updateEstimateMut = useMutation({
        mutationFn: (hours: number) =>
            api.updateTask(task.taskEstimatorId, { ...task, estimatedHours: hours }),
        onSuccess: () => { invalidate(); setEstimating(false); setHoursInput(''); },
    });

    const isBusy = deleteMut.isPending || completeMut.isPending || reopenMut.isPending || updateEstimateMut.isPending;

    function openEstimateInput() {
        setHoursInput(task.estimatedHours != null ? String(task.estimatedHours) : '');
        setEstimating(true);
        setTimeout(() => inputRef.current?.select(), 0);
    }

    function submitEstimate() {
        const val = parseFloat(hoursInput);
        if (!isNaN(val) && val >= 0) updateEstimateMut.mutate(val);
    }

    return (
        <div className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            {/* Top row: status badge + actions */}
            <div className="flex items-start justify-between gap-2">
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[task.status] ?? 'bg-gray-100 text-gray-700 ring-gray-200'}`}
                >
                    {STATUS_LABEL[task.status] ?? task.status}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(task)}
                        title="Edit task"
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => deleteMut.mutate()}
                        disabled={isBusy}
                        title="Delete task"
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Task description */}
            <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-3">{task.task}</p>

            {/* Hours */}
            {task.estimatedHours != null && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg className="h-4 w-4 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5z" clipRule="evenodd" />
                    </svg>
                    <span>
                        <span className="font-semibold text-gray-800">{task.estimatedHours}</span> hrs estimated
                    </span>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                {estimating ? (
                    <form
                        className="flex items-center gap-1.5"
                        onSubmit={(e) => { e.preventDefault(); submitEstimate(); }}
                    >
                        <input
                            ref={inputRef}
                            type="number"
                            min="0"
                            step="0.5"
                            value={hoursInput}
                            onChange={(e) => setHoursInput(e.target.value)}
                            placeholder="hrs"
                            className="w-20 rounded-lg border border-indigo-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={updateEstimateMut.isPending || hoursInput === ''}
                            className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {updateEstimateMut.isPending ? 'Saving…' : 'Save'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setEstimating(false)}
                            className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={openEstimateInput}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343z" />
                        </svg>
                        Re-estimate
                    </button>
                )}

                {task.status === 'IN_PROGRESS' && (
                    <button
                        onClick={() => completeMut.mutate()}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {completeMut.isPending ? (
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                        ) : (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143z" clipRule="evenodd" />
                            </svg>
                        )}
                        Complete
                    </button>
                )}

                {(task.status === 'COMPLETED' || task.status === 'FAILED') && (
                    <button
                        onClick={() => reopenMut.mutate()}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {reopenMut.isPending ? (
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                        ) : (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 0 1 0 10.75H10.75a.75.75 0 0 1 0-1.5h2.875a3.875 3.875 0 0 0 0-7.75H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.06.025z" clipRule="evenodd" />
                            </svg>
                        )}
                        Reopen
                    </button>
                )}
            </div>

            {/* Mutation errors */}
            {(deleteMut.isError || completeMut.isError || reopenMut.isError || updateEstimateMut.isError) && (
                <p className="text-xs text-red-600 mt-1">
                    {(deleteMut.error ?? completeMut.error ?? reopenMut.error ?? updateEstimateMut.error)?.message}
                </p>
            )}
        </div>
    );
}
