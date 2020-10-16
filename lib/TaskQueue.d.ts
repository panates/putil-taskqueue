import {EventEmitter} from 'events';

declare module 'putil-taskqueue' {


    export interface TaskQueueOptions {
        maxQueue?: number;
    }

    export type Task = (done: (e?: Error) => void) => void;
    export type AsyncTask = () => Promise<void>;

    export default class TaskQueue extends EventEmitter {

        constructor(options?: TaskQueueOptions);

        get size(): number;

        clear(): void;

        pause(): void;

        resume(): void;

        enqueue(task: Task | AsyncTask, toFirst?: boolean): Promise<void>;

    }

}
