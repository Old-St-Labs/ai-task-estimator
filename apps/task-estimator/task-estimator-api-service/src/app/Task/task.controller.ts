import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBody,
    ApiParam,
    ApiQuery,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { CreateTaskEstimator, TaskEstimatorDto, StateStatus } from '@dto';
import { CreateTaskHandler } from './commands/create.task.handler';
import { GetTaskByIdQuery } from './queries/get.task.by.id.query';
import { GetTaskByTitleQuery } from './queries/get.task.by.title.query';
import { ListTasksByStatusQuery } from './queries/list.tasks.by.status.query';
import { ListTasksByStatusAndAssigneeQuery } from './queries/list.tasks.by.status.and.assignee.query';
import { ListTasksQuery } from './queries/list.tasks.query';
import { UpdateTaskHandler } from './commands/update.task.handler';
import { DeleteTaskHandler } from './commands/delete.task.handler';
import { CompleteTaskHandler } from './commands/complete.task.handler';
import { ReopenTaskHandler } from './commands/reopen.task.handler';
import { EstimateTaskHandler } from './commands/estimate.task.handler';

@ApiTags('task')
@Controller('v1/tasks')
export class TaskController {
    constructor(
        private readonly createTaskHandler: CreateTaskHandler,
        private readonly updateTaskHandler: UpdateTaskHandler,
        private readonly deleteTaskHandler: DeleteTaskHandler,
        private readonly completeTaskHandler: CompleteTaskHandler,
        private readonly reopenTaskHandler: ReopenTaskHandler,
        private readonly estimateTaskHandler: EstimateTaskHandler,
        private readonly getTaskByIdQuery: GetTaskByIdQuery,
        private readonly getTaskByTitleQuery: GetTaskByTitleQuery,
        private readonly listTasksByStatusQuery: ListTasksByStatusQuery,
        private readonly listTasksByStatusAndAssigneeQuery: ListTasksByStatusAndAssigneeQuery,
        private readonly listTasksQuery: ListTasksQuery,
    ) {}

    // ── STATIC PATHS — declare before dynamic /:taskId routes ─────────────────

    @Get('search')
    @ApiOperation({ summary: 'Search tasks by name, estimated hours, and/or status' })
    @ApiQuery({ name: 'task', required: false, description: 'Partial task name to search for', example: 'login' })
    @ApiQuery({ name: 'estimatedHours', required: false, type: Number, description: 'Filter by estimated hours', example: 8 })
    @ApiQuery({ name: 'status', required: false, enum: StateStatus, description: 'Filter by status' })
    @ApiOkResponse({ type: TaskEstimatorDto, isArray: true })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    searchTasks(
        @Query('task') task?: string,
        @Query('estimatedHours') estimatedHours?: string,
        @Query('status') status?: StateStatus,
    ): Promise<TaskEstimatorDto[]> {
        return this.listTasksQuery.execute({
            task,
            estimatedHours: estimatedHours !== undefined ? Number(estimatedHours) : undefined,
            status,
        });
    }

    @Get()
    @ApiOperation({ summary: 'Look up a task by title' })
    @ApiQuery({ name: 'title', required: true, description: 'Title of the task to search for', example: 'Build login page' })
    @ApiOkResponse({ type: TaskEstimatorDto })
    @ApiBadRequestResponse({ description: 'Missing or invalid query parameter' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    getTaskByTitle(@Query('title') title: string): Promise<TaskEstimatorDto | null> {
        return this.getTaskByTitleQuery.execute(title);
    }

    // ── DYNAMIC /:taskId PATHS ─────────────────────────────────────────────────

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new task' })
    @ApiBody({ type: CreateTaskEstimator })
    @ApiCreatedResponse({ type: TaskEstimatorDto })
    @ApiBadRequestResponse({ description: 'Validation error in request body' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    createTask(@Body() body: CreateTaskEstimator): Promise<TaskEstimatorDto> {
        return this.createTaskHandler.execute(body);
    }

    @Get(':taskId')
    @ApiOperation({ summary: 'Get a single task by ID' })
    @ApiParam({ name: 'taskId', description: 'Unique identifier of the task', example: 'task-abc-123' })
    @ApiOkResponse({ type: TaskEstimatorDto })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    getTaskById(@Param('taskId') taskId: string): Promise<TaskEstimatorDto | null> {
        return this.getTaskByIdQuery.execute(taskId);
    }

    @Patch(':taskId')
    @ApiOperation({ summary: 'Update task fields' })
    @ApiParam({ name: 'taskId', description: 'Unique identifier of the task', example: 'task-abc-123' })
    @ApiBody({ type: TaskEstimatorDto })
    @ApiOkResponse({ type: TaskEstimatorDto })
    @ApiBadRequestResponse({ description: 'Validation error in request body' })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    updateTask(@Param('taskId') taskId: string, @Body() body: TaskEstimatorDto): Promise<TaskEstimatorDto> {
        return this.updateTaskHandler.execute(taskId, body);
    }

    @Delete(':taskId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a task' })
    @ApiParam({ name: 'taskId', description: 'Unique identifier of the task', example: 'task-abc-123' })
    @ApiNoContentResponse({ description: 'Task deleted successfully' })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    deleteTask(@Param('taskId') taskId: string): Promise<void> {
        return this.deleteTaskHandler.execute(taskId);
    }

    @Post(':taskId/complete')
    @ApiOperation({ summary: 'Mark a task as complete' })
    @ApiParam({ name: 'taskId', description: 'Unique identifier of the task', example: 'task-abc-123' })
    @ApiOkResponse({ type: TaskEstimatorDto })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiConflictResponse({ description: 'Task is already in a terminal state' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    completeTask(@Param('taskId') taskId: string): Promise<Partial<TaskEstimatorDto>> {
        return this.completeTaskHandler.execute(taskId);
    }

    @Post(':taskId/reopen')
    @ApiOperation({ summary: 'Reopen a completed or failed task' })
    @ApiParam({ name: 'taskId', description: 'Unique identifier of the task', example: 'task-abc-123' })
    @ApiOkResponse({ type: TaskEstimatorDto })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiConflictResponse({ description: 'Task cannot be reopened from its current state' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    reopenTask(@Param('taskId') taskId: string): Promise<Partial<TaskEstimatorDto>> {
        return this.reopenTaskHandler.execute(taskId);
    }

    @Post(':taskId/estimate')
    @ApiOperation({ summary: 'Request an AI estimate for a task' })
    @ApiParam({ name: 'taskId', description: 'Unique identifier of the task', example: 'task-abc-123' })
    @ApiOkResponse({ type: TaskEstimatorDto })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiConflictResponse({ description: 'Task is not in a valid state for estimation' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    estimateTask(@Param('taskId') taskId: string): Promise<Partial<TaskEstimatorDto>> {
        return this.estimateTaskHandler.execute(taskId);
    }
}

