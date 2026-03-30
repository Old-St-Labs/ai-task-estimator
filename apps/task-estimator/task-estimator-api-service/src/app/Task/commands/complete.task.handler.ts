import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto, StateStatus } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class CompleteTaskHandler {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    execute(taskId: string): Promise<TaskEstimatorDto> {
        return this.model.update({ status: StateStatus.COMPLETED }, 'taskEstimatorId', taskId);
    }
}
