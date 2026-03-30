import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';

@Injectable()
export class GetTaskByTitleQuery {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    execute(title: string): Promise<TaskEstimatorDto | null> {
        return this.model.get('task', title);
    }
}
