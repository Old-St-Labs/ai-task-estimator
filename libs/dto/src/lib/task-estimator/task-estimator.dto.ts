import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { StateStatus } from './task-estimator.enum';

export class TaskEstimatorDto {
    @ApiProperty()
    @IsString()
    taskEstimatorId!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    task!: string;

    @ApiProperty()
    @IsNumber()
    estimatedHours!: number;

    @ApiProperty()
    @IsEnum(StateStatus)
    status!: StateStatus;

    @ApiProperty()
    @IsString()
    @IsOptional()
    AIResponse?: string;
}
