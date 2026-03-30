import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto } from '@dto';

@Injectable()
export class UpdateTaskHandler {
    execute(taskId: string, body: TaskEstimatorDto): Promise<TaskEstimatorDto> {
        // TODO: implement when Task entity and repository are ready
        return Promise.resolve({ ...body, taskEstimatorId: taskId });
    }
}
