import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskController } from './Task/task.controller';
import { CreateTaskHandler } from './Task/commands/create.task.handler';
import { UpdateTaskHandler } from './Task/commands/update.task.handler';
import { DeleteTaskHandler } from './Task/commands/delete.task.handler';
import { CompleteTaskHandler } from './Task/commands/complete.task.handler';
import { ReopenTaskHandler } from './Task/commands/reopen.task.handler';
import { EstimateTaskHandler } from './Task/commands/estimate.task.handler';
import { GetTaskByIdQuery } from './Task/queries/get.task.by.id.query';
import { GetTaskByTitleQuery } from './Task/queries/get.task.by.title.query';
import { ListTasksByStatusQuery } from './Task/queries/list.tasks.by.status.query';
import { ListTasksByStatusAndAssigneeQuery } from './Task/queries/list.tasks.by.status.and.assignee.query';
import { ListTasksQuery } from './Task/queries/list.tasks.query';
import { OpenAIService } from './openai/openai.service';

@Module({
    imports: [],
    controllers: [AppController, TaskController],
    providers: [
        AppService,
        OpenAIService,
        CreateTaskHandler,
        UpdateTaskHandler,
        DeleteTaskHandler,
        CompleteTaskHandler,
        ReopenTaskHandler,
        EstimateTaskHandler,
        GetTaskByIdQuery,
        GetTaskByTitleQuery,
        ListTasksByStatusQuery,
        ListTasksByStatusAndAssigneeQuery,
        ListTasksQuery,
    ],
})
export class AppModule {}
