# Description
- Abstract queue just an interface for custom queue implementation.
- Queue a simple async queue with wait timeout and process timeout.
- RoundRobinQueue async queue with round robin strategy.

## Types
- `class AbstractQueue extends EventEmitter {`
  `constructor();`
  `enqueue(...params: any[]): void;`
  `process(callback: ProcessCallback): this;`
`}`

- `class Queue extends AbstractQueue {`
  `constructor(options: QueueOptions);`
  `enqueue(...params: any[]): void;`
  `process(callback: ProcessCallback): this;`
`}`

- `class RoundRobinQueue extends Queue {`
  `constructor(options: RoundRobinQueueOptions);`
  `enqueue(...params: any[]): void;`
 `process(callback: ProcessCallback): this;`
`}`


```js
  const queue = new Queue({ concurrency: 100, timeout: 500, wait: 1000 });

  const job = async (task) => {
    const { interval } = task.params[0];
    await setTimeout(interval);
    return interval;
  };

  queue.process(job);

  queue.on("success", async (task) => {
    console.log(task);
  });

  queue.on("error", async (task) => {
    const { error } = task;
    console.log(error.message);
  });

  queue.on("drain", async () => {
    console.log('Queue drain');
  });

  for (let i = 0; i < 1000; i++) {
    const task = { name: `Task${i}`, interval: Math.floor(Math.random() * 200) };
    queue.enqueue(task);
  }
```

## Part of the naughty stack