"use strict";

const { Queue } = require("../main");
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { misc, async } = require("naughty-util");

describe("Queue", async () => {
  await it.skip("concurrency", async () => {
    const CONCURRENCY = 5;
    const JOBS_COUNT = 100;

    const queue = new Queue({ concurrency: 5 });
    const job = async task => void await async.pause(task.params[0].interval);
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
      queue.enqueue({ interval: misc.random(250) });
      assert.ok(queue.free >= 0);
      assert.ok(queue.free <= 5);
      assert.ok(queue.waiting <= JOBS_COUNT - CONCURRENCY);
    }
  });

  await it('tty', async () => {
    const { promise, resolve } = Promise.withResolvers();
    const TTY = 100;
    const CONCURRENCY = 3;
    const queue = new Queue({ concurrency: CONCURRENCY, tty: TTY });
    const job = async task => {
      await async.pause(task.params[0].interval)
    };
    queue.process(job);
    let success = 0;
    let error = 0;
    let drain = 0;
    queue.on("success", async (task) => success++);
    queue.on("error", async (task) => error++);
    queue.on("drain", async () => {
      if (drain > 0) throw new Error('Drain has to appear only ones');
      assert.equal(success, 3);
      assert.equal(error, 97);
      assert.equal(queue.waiting, 0);
      assert.equal(queue.free, CONCURRENCY);
      drain++;
      resolve();
    });
    const jobs = [
      { interval: 313 }, { interval: 274 }, { interval: 825 }, { interval: 77 },
      { interval: 232 }, { interval: 86 }, { interval: 746 }, { interval: 798 },
      { interval: 596 }, { interval: 840 }, { interval: 214 }, { interval: 408 },
      { interval: 122 }, { interval: 13 }, { interval: 320 }, { interval: 427 },
      { interval: 495 }, { interval: 480 }, { interval: 318 }, { interval: 891 },
      { interval: 30 }, { interval: 593 }, { interval: 330 }, { interval: 744 },
      { interval: 626 }, { interval: 842 }, { interval: 61 }, { interval: 762 },
      { interval: 253 }, { interval: 808 }, { interval: 584 }, { interval: 706 },
      { interval: 787 }, { interval: 893 }, { interval: 585 }, { interval: 22 },
      { interval: 153 }, { interval: 403 }, { interval: 701 }, { interval: 766 },
      { interval: 361 }, { interval: 709 }, { interval: 221 }, { interval: 179 },
      { interval: 906 }, { interval: 151 }, { interval: 706 }, { interval: 481 },
      { interval: 862 }, { interval: 331 }, { interval: 948 }, { interval: 955 },
      { interval: 921 }, { interval: 949 }, { interval: 291 }, { interval: 270 },
      { interval: 271 }, { interval: 952 }, { interval: 102 }, { interval: 103 },
      { interval: 851 }, { interval: 220 }, { interval: 15 }, { interval: 544 },
      { interval: 506 }, { interval: 951 }, { interval: 462 }, { interval: 541 },
      { interval: 65 }, { interval: 715 }, { interval: 569 }, { interval: 293 },
      { interval: 982 }, { interval: 862 }, { interval: 240 }, { interval: 596 },
      { interval: 507 }, { interval: 504 }, { interval: 303 }, { interval: 652 },
      { interval: 354 }, { interval: 783 }, { interval: 878 }, { interval: 685 },
      { interval: 503 }, { interval: 337 }, { interval: 968 }, { interval: 515 },
      { interval: 898 }, { interval: 226 }, { interval: 405 }, { interval: 970 },
      { interval: 291 }, { interval: 677 }, { interval: 658 }, { interval: 362 },
      { interval: 331 }, { interval: 33 }, { interval: 998 }, { interval: 89 }
    ]
    jobs.forEach((job) => queue.enqueue(job));
    return promise;
  });

  await it.skip('b', async () => {
    const queue = new Queue({ concurrency: 2, timeout: 1000 });
    const job = async (task) => void await async.pause(task.params[0].interval);
    queue.process(job);
    queue.on("success", async (task) => { });
    queue.on("error", async (task) => { });
    queue.on("drain", async () => { });
    for (let i = 0; i < 100; i++) {
      queue.enqueue({ interval: misc.random(2500) });
    }
  });

  await it.skip('c', async () => {
    const queue = new Queue({ concurrency: 100, timeout: 500, wait: 1000 });
    const job = async (task) => void await async.pause(task.params[0].interval);
    queue.process(job);
    queue.on("success", async (task) => { });
    queue.on("error", async (task) => { });
    queue.on("drain", async () => { });
    for (let i = 0; i < 100; i++) {
      queue.enqueue({ interval: misc.random(1000) });
    }
  });
});





