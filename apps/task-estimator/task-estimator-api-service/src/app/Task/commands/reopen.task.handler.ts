import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto, StateStatus } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class ReopenTaskHandler {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    execute(taskId: string): Promise<TaskEstimatorDto> {
        return this.model.update({ status: StateStatus.IN_PROGRESS }, 'taskEstimatorId', taskId);
    }
}
