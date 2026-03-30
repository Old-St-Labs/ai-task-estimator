import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class DeleteTaskHandler {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    execute(taskId: string): Promise<void> {
        return this.model.delete('taskEstimatorId', taskId);
    }
}
