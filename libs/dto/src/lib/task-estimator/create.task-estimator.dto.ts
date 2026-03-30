import { OmitType } from '@nestjs/swagger';
import { TaskEstimatorDto } from './task-estimator.dto';

export class CreateTaskEstimator extends OmitType(TaskEstimatorDto, [
    'taskEstimatorId',
    'status',
    'estimatedHours',
    'AIResponse',
] as const) { }
