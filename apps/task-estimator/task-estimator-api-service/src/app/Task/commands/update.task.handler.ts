import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class UpdateTaskHandler {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    execute(taskId: string, body: Partial<TaskEstimatorDto>): Promise<TaskEstimatorDto> {
        return this.model.update(body, 'taskEstimatorId', taskId);
    }
}
