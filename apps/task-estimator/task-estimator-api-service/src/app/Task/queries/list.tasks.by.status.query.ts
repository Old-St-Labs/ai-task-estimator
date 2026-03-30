import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto, StateStatus } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class ListTasksByStatusQuery {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    async execute(status: StateStatus): Promise<TaskEstimatorDto[]> {
        const all = await this.model.getAll();
        return all.filter(t => t.status === status);
    }
}
