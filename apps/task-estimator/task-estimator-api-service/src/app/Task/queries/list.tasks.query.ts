import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto, StateStatus } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class ListTasksQuery {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    async execute(filters: {
        task?: string;
        estimatedHours?: number;
        status?: StateStatus;
    }): Promise<TaskEstimatorDto[]> {
        const all = await this.model.getAll();
        return all.filter(t => {
            if (filters.task && !t.task.toLowerCase().includes(filters.task.toLowerCase())) return false;
            if (filters.estimatedHours !== undefined && t.estimatedHours !== filters.estimatedHours) return false;
            if (filters.status && t.status !== filters.status) return false;
            return true;
        });
    }
}
