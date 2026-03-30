import { Injectable } from '@nestjs/common';
import { CreateTaskEstimator, TaskEstimatorDto, StateStatus } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class CreateTaskHandler {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    execute(body: CreateTaskEstimator): Promise<TaskEstimatorDto> {
        const entity: TaskEstimatorDto = { ...body, taskEstimatorId: crypto.randomUUID(), status: StateStatus.IN_PROGRESS };
        return this.model.create(entity);
    }
}
