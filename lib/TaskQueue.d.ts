import {EventEmitter} from 'events';

export declare interface TaskQueueOptions {
  maxQueue?: number;
}

export declare type Task = (done: (e?: Error) => void) => void;
export declare type AsyncTask<T = any> = () => Promise<T>;

declare class TaskQueue extends EventEmitter {

  constructor(options?: TaskQueueOptions);

  get size(): number;

  clear(): void;

  pause(): void;

  resume(): void;

  enqueue<T>(task: Task | AsyncTask<T>, toFirst?: boolean): Promise<T>;

}

export default TaskQueue;
