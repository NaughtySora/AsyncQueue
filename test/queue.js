"use strict";

const { Queue } = require("../main");
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { misc, async } = require("naughty-util");
const { events, JOBS } = require("./utils.js");

describe("Queue", async () => {
  await it("concurrency", async () => {
    const { promise, resolve } = Promise.withResolvers();
    const CONCURRENCY = 5;
    const JOBS_COUNT = 100;

    const queue = new Queue({ concurrency: CONCURRENCY });
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
      assert.equal(queue.free, CONCURRENCY);
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
