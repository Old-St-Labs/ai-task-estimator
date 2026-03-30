import { Injectable } from '@nestjs/common';
import { CreateTaskEstimator, TaskEstimatorDto, StateStatus } from '@dto';

@Injectable()
export class CreateTaskHandler {
    execute(body: CreateTaskEstimator): Promise<TaskEstimatorDto> {
        // TODO: implement when Task entity and repository are ready
        return Promise.resolve({ taskEstimatorId: 'task-1', status: StateStatus.IN_PROGRESS, ...body });
    }
}
