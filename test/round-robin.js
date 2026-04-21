'use strict';

const { RoundRobinQueue } = require("../main");
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { events, JOBS } = require("./utils.js");
const { async } = require("naughty-util");

const factor = (concurrency, param) => {
  return param[0].interval % concurrency;
};

describe("RoundRobinQueue", async () => {
  await it("concurrency", async () => {
    const { promise, resolve } = Promise.withResolvers();
    const CONCURRENCY = 5;
    const f = factor.bind(null, CONCURRENCY);

    const queue = new RoundRobinQueue({ concurrency: CONCURRENCY, factor: f });
    const job = async task => void await async.pause(task.params[0].interval);
    queue.process(job);

    const { inc, get } = events();
    queue.on("success", () => inc("success"));
    queue.on("error", () => inc("error"));
    queue.on("drain", () => {
      if (get("drain") > 0) throw new Error('Drain has to appear only ones');
      assert.equal(get("success"), 100);
      assert.equal(get("error"), 0);
      assert.equal(queue.waiting, 0);
      assert.equal(queue.free, CONCURRENCY);
      inc("drain");
      resolve();
    });

    JOBS.forEach(job => {
      queue.enqueue(job);
      assert.ok(queue.free >= 0);
      assert.ok(queue.free <= CONCURRENCY);
      assert.ok(queue.waiting <= (100 - CONCURRENCY));
    });
    return promise;
  });
});

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

// {
//   const queue = new RoundRobinQueue({ concurrency: 25, categorize, timeout: 500, wait: 1200 });
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

//   for (let i = 0; i < 100; i++) {
//     const task = { name: `Task${i}`, interval: Math.floor(Math.random() * 1500) };
//     queue.enqueue(task);
//   }
// }
