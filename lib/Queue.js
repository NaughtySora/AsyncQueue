"use strict";

const AbstractQueue = require("../lib/AbstractQueue.js");

const AsyncConstructor = (async () => { }).constructor;

class Queue extends AbstractQueue {
  count = 0;
  waiting = [];
  callback = null;

  constructor(options = {}) {
    const { concurrency, wait = Infinity, timeout = Infinity } = options;
    super();
    this.concurrency = concurrency;
    this.wait = wait;
    this.timeout = timeout;
  }

  enqueue(...params) {
    const freeChannel = this.count < this.concurrency;
    const task = { params, error: null, result: null, start: Date.now() };
    if (freeChannel) return void this.next(task);
    this.waiting.push(task);
  }

  process(callback) {
    const constructor = callback.constructor;
    if (constructor !== AsyncConstructor) {
      throw new Error("Callback has to be an async function");
    }
    this.callback = callback;
    return this;
  }

  async next(task) {
    const callback = this.callback;
    if (!callback) throw new Error('No process callback');
    this.count++;
    if (this.timeout !== Infinity) return void this.#timed(task);
    try {
      task.result = await callback(task);
    } catch (error) {
      task.error = error;
    }
    this.count--;
    this.finish(task);
  }

  async #timed(task) {
    const { promise, reject, } = Promise.withResolvers();
    let timer = setTimeout(() => {
      reject(new Error('Processing timeout'));
      clearTimeout(timer);
      timer = null;
    }, this.timeout);
    try {
      const result = await Promise.race([this.callback(task), promise]);
      task.result = result;
    } catch (error) {
      task.error = error;
    }
    this.count--;
    this.finish(task);
  }

  expired(task) {
    const wait = this.wait;
    if (wait === Infinity) return false;
    const delay = Date.now() - task.start;
    if (delay <= wait) return false;
    task.error = new Error('Waiting timeout');
    return true;
  }

  take() {
    const task = this.waiting.shift();
    const expired = this.expired(task);
    if (expired) process.nextTick(() => void this.finish(task));
    else this.next(task);
  }

  finish(task) {
    const emit = this.emit;
    if (task.error) emit.call(this, 'error', task);
    else emit.call(this, 'success', task);
    emit.call(this, 'done', task);
    const pending = this.waiting.length > 0;
    if (pending) this.take();
    if (this.count === 0 && !pending) emit.call(this, 'drain');
  }
}

module.exports = Queue;