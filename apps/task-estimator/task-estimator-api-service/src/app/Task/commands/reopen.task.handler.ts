import { Injectable } from '@nestjs/common';
import { TaskEstimatorDto, StateStatus } from '@dto';

@Injectable()
export class ReopenTaskHandler {
    execute(taskId: string): Promise<Partial<TaskEstimatorDto>> {
        // TODO: implement when Task entity and repository are ready
        return Promise.resolve({ taskEstimatorId: taskId, status: StateStatus.IN_PROGRESS });
    }
}
