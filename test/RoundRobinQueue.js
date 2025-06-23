'use strict';

const RoundRobinQueue = require("../lib/RoundRobinQueue.js");
const { setTimeout } = require("node:timers/promises");

const categorize = () => Math.floor((Math.random() * 5)) + 1;

module.exports = () => {
  // {
  //   const queue = new RoundRobinQueue({ concurrency: 15, categorize });
  //   queue.process(async (task) => {
  //     const interval = task.params[0].interval;
  //     await setTimeout(interval);
  //     return interval;
  //   });

  //   queue.on("success", async (task) => {
  //     console.log(task);
  //   });

  //   queue.on("error", async ({ error }) => {
  //     console.log(error.message);
  //   });

  //   queue.on("drain", async () => {
  //     console.log('Queue drain');
  //   });

  //   for (let i = 0; i < 1000; i++) {
  //     const task = { name: `Task${i}`, interval: Math.floor(Math.random() * 400) };
  //     queue.enqueue(task);
  //   }
  // }

  // {
  //   const queue = new RoundRobinQueue({ concurrency: 12, categorize, wait: 1000 });
  //   queue.process(async (task) => {
  //     const interval = task.params[0].interval;
  //     await setTimeout(interval);
  //     return interval;
  //   });

  //   queue.on("success", async (task) => {
  //     console.log(task);
  //   });

  //   queue.on("error", async ({ error }) => {
  //     console.log(error.message);
  //   });

  //   queue.on("drain", async () => {
  //     console.log('Queue drain');
  //   });

  //   for (let i = 0; i < 1000; i++) {
  //     const task = { name: `Task${i}`, interval: Math.floor(Math.random() * 400) };
  //     queue.enqueue(task);
  //   }
  // }

  // {
  //   const queue = new RoundRobinQueue({ concurrency: 5, categorize, timeout: 300 });
  //   queue.process(async (task) => {
  //     const interval = task.params[0].interval;
  //     await setTimeout(interval);
  //     return interval;
  //   });

  //   queue.on("success", async (task) => {
  //     console.log(task);
  //   });

  //   queue.on("error", async ({ error }) => {
  //     console.log(error.message);
  //   });

  //   queue.on("drain", async () => {
  //     console.log('Queue drain');
  //   });

  //   for (let i = 0; i < 1000; i++) {
  //     const task = { name: `Task${i}`, interval: Math.floor(Math.random() * 400) };
  //     queue.enqueue(task);
  //   }
  // }

  {
    const queue = new RoundRobinQueue({ concurrency: 25, categorize, timeout: 500, wait: 1200 });
    queue.process(async (task) => {
      const interval = task.params[0].interval;
      await setTimeout(interval);
      return interval;
    });

    queue.on("success", async (task) => {
      console.log(task);
    });

    queue.on("error", async ({ error }) => {
      console.log(error.message);
    });

    queue.on("drain", async () => {
      console.log('Queue drain');
    });

    for (let i = 0; i < 100; i++) {
      const task = { name: `Task${i}`, interval: Math.floor(Math.random() * 1500) };
      queue.enqueue(task);
    }
  }
};
