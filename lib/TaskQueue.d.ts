import {EventEmitter} from 'events';

declare module 'putil-taskqueue' {


    export interface TaskQueueOptions {
        maxQueue?: number;
    }

    export type Task = (done: (e?: Error) => void) => void;
    export type AsyncTask<T = any> = () => Promise<T>;

    export default class TaskQueue extends EventEmitter {

        constructor(options?: TaskQueueOptions);

        get size(): number;

        clear(): void;

        pause(): void;

        resume(): void;

        enqueue<T>(task: Task | AsyncTask<T>, toFirst?: boolean): Promise<T>;

    }

}
