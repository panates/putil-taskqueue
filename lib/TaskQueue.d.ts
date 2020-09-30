
declare module 'putil-taskqueue' {


    export interface TaskQueueOptions {
        maxQueue?: number;
    }

    export default class TaskQueue {

        constructor(options?: TaskQueueOptions);

        get size(): number;

        clear(): void;

    }

}
