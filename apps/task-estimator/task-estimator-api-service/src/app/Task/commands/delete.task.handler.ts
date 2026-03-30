import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteTaskHandler {
    execute(taskId: string): Promise<void> {
        // TODO: implement when Task entity and repository are ready
        return Promise.resolve();
    }
}
