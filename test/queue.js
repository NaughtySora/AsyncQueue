"use strict";

const { Queue } = require("../main");
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { setTimeout } = require("node:timers/promises");

describe("Queue", async () => {
  await it("concurrency", async () => {
    const CONCURRENCY = 5;
    const JOBS_COUNT = 100;

    const queue = new Queue({ concurrency: 5 });
    const job = async task => void await setTimeout(task.params[0].interval);
    queue.process(job);

    let success = 0;
    let error = 0;
    let drain = 0;
    queue.on("success", async (task) => success++);
    queue.on("error", async (task) => error++);
    queue.on("drain", async () => {
      if (drain > 0) throw new Error('Drain has to appear only ones');
      assert.equal(success, JOBS_COUNT);
      assert.equal(error, 0);
      assert.equal(queue.waiting, 0);
      assert.equal(queue.free, 5);
      drain++;
    });

    for (let i = 0; i < JOBS_COUNT; i++) {
      queue.enqueue({ interval: Math.floor(Math.random() * 200) });
      assert.ok(queue.free >= 0);
      assert.ok(queue.free <= 5);
      assert.ok(queue.waiting <= JOBS_COUNT - CONCURRENCY);
    }

  });
});

// module.exports = () => {


//   // {
//   //   const queue = new Queue({ concurrency: 10, wait: 1000 });

//   //   const job = async (task) => {
//   //     const { interval } = task.params[0];
//   //     await setTimeout(interval);
//   //     return interval;
//   //   };

//   //   queue.process(job);

//   //   queue.on("success", async (task) => {
//   //     console.log(task);
//   //   });

//   //   queue.on("error", async (task) => {
//   //     const { error } = task;
//   //     console.log(error.message);
//   //   });

//   //   queue.on("drain", async () => {
//   //     console.log('Queue drain');
//   //   });

//   //   for (let i = 0; i < 100; i++) {
//   //     const task = { name: `Task${i}`, interval: Math.floor(Math.random() * 500) };
//   //     queue.enqueue(task);
//   //   }
//   // }

//   // {
//   //   const queue = new Queue({ concurrency: 2, timeout: 1000 });

//   //   const job = async (task) => {
//   //     const { interval } = task.params[0];
//   //     await setTimeout(interval);
//   //     return interval;
//   //   };

//   //   queue.process(job);

//   //   queue.on("success", async (task) => {
//   //     console.log(task);
//   //   });

//   //   queue.on("error", async (task) => {
//   //     const { error } = task;
//   //     console.log(error.message);
//   //   });

//   //   queue.on("drain", async () => {
//   //     console.log('Queue drain');
//   //   });

//   //   for (let i = 0; i < 100; i++) {
//   //     const task = { name: `Task${i}`, interval: Math.floor(Math.random() * 2500) };
//   //     queue.enqueue(task);
//   //   }
//   // }

//   {
//     const queue = new Queue({ concurrency: 100, timeout: 500, wait: 1000 });

//     const job = async (task) => {
//       const { interval } = task.params[0];
//       await setTimeout(interval);
//       return interval;
//     };

//     queue.process(job);

//     queue.on("success", async (task) => {
//       console.log(task);
//     });

//     queue.on("error", async (task) => {
//       const { error } = task;
//       console.log(error.message);
//     });

//     queue.on("drain", async () => {
//       console.log('Queue drain');
//     });

//     for (let i = 0; i < 100; i++) {
//       const task = { name: `Task${i}`, interval: Math.floor(Math.random() * 1000) };
//       queue.enqueue(task);
//     }
//   }
// };