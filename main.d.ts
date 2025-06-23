import { EventEmitter } from "node:events";

type ProcessCallback = (...params: any[]) => Promise<any>;

interface QueueOptions {
  concurrency: number;
  wait?: number;
  timeout?: number;
}

interface RoundRobinQueueOptions extends QueueOptions {
  categorize: (...params: any[]) => any;
}

export class AbstractQueue extends EventEmitter {
  constructor();
  enqueue(...params: any[]): void;
  process(callback: ProcessCallback): this;
}

export class Queue extends AbstractQueue {
  constructor(options: QueueOptions);
  enqueue(...params: any[]): void;
  process(callback: ProcessCallback): this;
}

export class RoundRobinQueue extends Queue {
  constructor(options: RoundRobinQueueOptions);
  enqueue(...params: any[]): void;
  process(callback: ProcessCallback): this;
}