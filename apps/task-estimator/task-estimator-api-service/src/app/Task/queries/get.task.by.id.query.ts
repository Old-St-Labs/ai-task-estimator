import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class GetTaskByIdQuery {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    execute(taskId: string): Promise<TaskEstimatorDto | null> {
        return this.model.get('taskEstimatorId', taskId);
    }
}
