"use strict";
const Queue = require("./Queue.js");

class RoundRobinQueue extends Queue {
  robinGroups = new Map();

  constructor(options = {}) {
    super(options);
    const { categorize } = options;
    if (typeof categorize !== "function") {
      throw new Error("categorize function is not provided");
    }
    this.categorize = categorize;
  }

  enqueue(...params) {
    const freeChannel = this.count < this.concurrency;
    const task = { params, error: null, result: null, start: Date.now() };
    if (freeChannel) return void this.next(task);
    const factor = this.categorize(params);
    const groups = this.robinGroups;
    const waiting = this.waiting;
    let group = groups.get(factor);
    if (!group) groups.set(factor, group = [task]);
    else group.push(task);
    if (!waiting.includes(group)) waiting.push(group);
  }

  take() {
    const waiting = this.waiting;
    const group = waiting.shift();
    const task = group.shift();
    const expired = this.expired(task);
    if (group.length > 0) waiting.push(group);
    if (expired) process.nextTick(() => void this.finish(task));
    else this.next(task);
  }
}

module.exports = RoundRobinQueue;
