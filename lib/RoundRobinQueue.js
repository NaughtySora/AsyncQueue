"use strict";

const { Queue, introspect } = require("./Queue.js");
const { nextTick } = require("node:process");
const { SLL } = require("./SLL.js");

/**
 * @improvements
 * can add cache for SLL, when group is 0,
 * instead of just deleting the group, put clear SLL into 
 * cache, and use it later when new SLL needed
 */

class RoundRobinQueue extends Queue {
  #groups = new Map();
  #factor = null;

  constructor(options = {}) {
    super(options);
    const { factor } = options;
    if (typeof factor !== "function") {
      throw new TypeError("categorize function is not provided");
    }
    this.#factor = factor;
  }

  #add(task) {
    const group = this.#groups.get(task.factor);
    if (group === undefined) {
      const group = new SLL();
      group.push(task);
      this.#groups.set(task.factor, group);
      this.queue.push(group);
    } else {
      group.push(task);
    }
  }

  enqueue(...params) {
    const task = {
      factor: this.#factor(params),
      params, error: null,
      result: null, start: Date.now(),
    };
    if (this.isFree) return void this.next(task);
    this.#add(task);
  }

  take() {
    const queue = this.queue;
    const group = queue.shift();
    const task = group.shift();
    const expired = this.expired(task);
    if (group.length > 0) queue.push(group);
    else this.#groups.delete(task.factor);
    if (expired) nextTick(() => void this.finish(task));
    else this.next(task);
  }
}

module.exports = { RoundRobinQueue };
