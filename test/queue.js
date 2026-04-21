"use strict";

const { Queue } = require("../main");
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { misc, async } = require("naughty-util");

const JOBS = [
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
];

const counters = (...names) => {
  const counters = {};
  for (const name of names) counters[name] = 0;
  return {
    inc(name) {
      counters[name]++;
    },
    get(name) {
      return counters[name];
    },
    counters,
  };
};

const events = counters.bind(null, "success", "error", "drain");

describe("Queue", async () => {
  await it("concurrency", async () => {
    const { promise, resolve } = Promise.withResolvers();
    const CONCURRENCY = 5;
    const JOBS_COUNT = 100;

    const queue = new Queue({ concurrency: 5 });
    const job = async task => void await async.pause(task.params[0].interval);
    queue.process(job);
    const { inc, get } = events();
    queue.on("success", () => inc("success"));
    queue.on("error", () => inc("error"));
    queue.on("drain", () => {
      if (get("drain") > 0) throw new Error('Drain has to appear only ones');
      assert.equal(get("success"), JOBS_COUNT);
      assert.equal(get("error"), 0);
      assert.equal(queue.waiting, 0);
      assert.equal(queue.free, 5);
      inc("drain");
      resolve();
    });

    JOBS.forEach(job => {
      queue.enqueue(job);
      assert.ok(queue.free >= 0);
      assert.ok(queue.free <= 5);
      assert.ok(queue.waiting <= (JOBS_COUNT - CONCURRENCY));
    });
    return promise;
  });

  await it('tty', async () => {
    const { promise, resolve } = Promise.withResolvers();
    const TTY = 100;
    const CONCURRENCY = 3;
    const queue = new Queue({ concurrency: CONCURRENCY, tty: TTY });
    const job = async task => {
      await async.pause(task.params[0].interval);
    };
    queue.process(job);
    const { inc, get } = events();
    queue.on("success", () => inc("success"));
    queue.on("error", () => inc("error"));
    queue.on("drain", () => {
      if (get("drain") > 0) throw new Error('Drain has to appear only ones');
      assert.equal(get("success"), 3);
      assert.equal(get("error"), 97);
      assert.equal(queue.waiting, 0);
      assert.equal(queue.free, CONCURRENCY);
      inc("drain");
      resolve();
    });
    JOBS.forEach(job => {
      queue.enqueue(job);
    });
    return promise;
  });

  await it('timeout', async () => {
    const { promise, resolve } = Promise.withResolvers();
    const CONCURRENCY = 2;
    const queue = new Queue({ concurrency: CONCURRENCY, timeout: 100 });
    const job = async task => void await async.pause(task.params[0].interval);
    queue.process(job);
    const { inc, get } = events();
    queue.on("success", () => inc("success"));
    queue.on("error", () => inc("error"));
    queue.on("drain", () => {
      if (get("drain") > 0) throw new Error('Drain has to appear only ones');
      assert.equal(get("success"), 10);
      assert.equal(get("error"), 90);
      assert.equal(queue.waiting, 0);
      assert.equal(queue.free, CONCURRENCY);
      inc("drain")
      resolve();
    });
    JOBS.forEach(job => {
      queue.enqueue(job);
    });
    return promise;
  });

  await it('tty + timeout', async () => {
    const { promise, resolve } = Promise.withResolvers();
    const CONCURRENCY = 5;
    const queue = new Queue({ concurrency: CONCURRENCY, timeout: 750, tty: 1000 });
    const job = async task => void await async.pause(task.params[0].interval);
    queue.process(job);
    const { inc, get, counters } = events();
    queue.on("success", () => inc("success"));
    queue.on("error", () => inc("error"));
    queue.on("drain", () => {
      if (get("drain") > 0) throw new Error('Drain has to appear only ones');
      assert.equal(get("success"), 13);
      assert.equal(get("error"), 87);
      assert.equal(queue.waiting, 0);
      assert.equal(queue.free, CONCURRENCY);
      inc("drain")
      resolve();
    });
    JOBS.forEach(job => queue.enqueue(job));
    return promise;
  });
});
