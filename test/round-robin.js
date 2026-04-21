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
