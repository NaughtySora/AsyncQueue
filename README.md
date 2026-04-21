# AsyncQueue
Simple async queue with to control and postpone async operations.

```js
const queue = new Queue({ concurrency: 5 });
const job = async task => {
  // ... async work
};
queue.process(job);
queue.enqueue(data);

queue.on("success", callback);
queue.on("error", callback);
queue.on("done", callback);
```

## Part of the naughty stack
