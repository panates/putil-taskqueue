declare module 'putil-taskqueue' {


    export interface TaskQueueOptions {
        maxQueue?: number;
    }

    export type Task = (done: (e?: Error) => void) => void;
    export type AsyncTask = () => Promise<void>;

    export default class TaskQueue {

        constructor(options?: TaskQueueOptions);

        get size(): number;

        clear(): void;

        enqueue(task: Task | AsyncTask): Promise<void>;

    }

}
