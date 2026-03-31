'use client';

import { useForm } from 'react-hook-form';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types/task';

interface Props {
    task?: Task;
    onSubmit: (data: CreateTaskPayload | UpdateTaskPayload) => Promise<void>;
    onClose: () => void;
    isLoading: boolean;
}

interface FormValues {
    task: string;
    estimatedHours: string;
}

export function TaskFormModal({ task, onSubmit, onClose, isLoading }: Props) {
    const isEdit = Boolean(task);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            task: task?.task ?? '',
            estimatedHours: task?.estimatedHours != null ? String(task.estimatedHours) : '',
        },
    });

    async function submit(values: FormValues) {
        const payload: CreateTaskPayload | UpdateTaskPayload = {
            task: values.task,
            ...(isEdit && values.estimatedHours !== ''
                ? { estimatedHours: Number(values.estimatedHours) }
                : {}),
        };
        await onSubmit(payload);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                className="w-full max-w-md rounded-2xl bg-white shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 id="modal-title" className="text-lg font-semibold">
                        {isEdit ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit(submit)} className="space-y-4 px-6 py-5">
                    <div>
                        <label htmlFor="task-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Task description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="task-name"
                            rows={3}
                            placeholder="e.g. Build the login page with OAuth support"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                            {...register('task', { required: 'Task description is required' })}
                        />
                        {errors.task && (
                            <p className="mt-1 text-xs text-red-600">{errors.task.message}</p>
                        )}
                    </div>

                    {isEdit && (
                        <div>
                            <label htmlFor="estimated-hours" className="block text-sm font-medium text-gray-700 mb-1">
                                Estimated hours
                            </label>
                            <input
                                id="estimated-hours"
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="e.g. 8"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                {...register('estimatedHours', {
                                    min: { value: 0, message: 'Must be ≥ 0' },
                                })}
                            />
                            {errors.estimatedHours && (
                                <p className="mt-1 text-xs text-red-600">{errors.estimatedHours.message}</p>
                            )}
                        </div>
                    )}

                    {!isEdit && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9z" clipRule="evenodd" />
                            </svg>
                            AI will automatically estimate the hours when the task is created.
                        </p>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {isLoading && (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                            )}
                            {isEdit ? 'Save changes' : 'Create & estimate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
