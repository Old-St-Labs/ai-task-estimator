import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class EstimateTaskHandler {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    execute(taskId: string): Promise<TaskEstimatorDto | null> {
        // TODO: trigger AI estimation logic, then persist result via model.update()
        return this.model.get('taskEstimatorId', taskId);
    }
}
