import { Injectable } from '@nestjs/common';
import { CreateTaskEstimator, TaskEstimatorDto, StateStatus } from '@dto';
import { JsonModel } from '@ai-task-estimator/database-service';
import { OpenAIService } from '../../openai/openai.service';

@Injectable()
export class CreateTaskHandler {
    private readonly model = new JsonModel<TaskEstimatorDto>(TaskEstimatorDto);

    constructor(private readonly openAIService: OpenAIService) {}

    async execute(body: CreateTaskEstimator): Promise<TaskEstimatorDto> {
        const { estimatedHours, rawResponse } = await this.openAIService.estimateHours(body.task);
        const entity: TaskEstimatorDto = {
            ...body,
            taskEstimatorId: crypto.randomUUID(),
            status: StateStatus.IN_PROGRESS,
            estimatedHours,
            AIResponse: rawResponse,
        };
        return this.model.create(entity);
    }
}
