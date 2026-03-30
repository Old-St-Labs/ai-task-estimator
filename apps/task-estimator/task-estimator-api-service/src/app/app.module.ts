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

@Module({
    imports: [],
    controllers: [AppController, TaskController],
    providers: [
        AppService,
        CreateTaskHandler,
        UpdateTaskHandler,
        DeleteTaskHandler,
        CompleteTaskHandler,
        ReopenTaskHandler,
        EstimateTaskHandler,
    ],
})
export class AppModule {}
