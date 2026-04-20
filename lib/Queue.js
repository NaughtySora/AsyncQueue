"use strict";

const AbstractQueue = require("../lib/AbstractQueue.js");
const { nextTick } = require("node:process");

class Queue extends AbstractQueue {
  #timeout;
  #wait;
  #concurrency;
  #count = 0;
  #waiting = [];
  #callback = null;

  constructor(options = {}) {
    super();
    this.#concurrency = options.concurrency ?? 1;
    this.#wait = options.wait ?? Infinity;
    this.#timeout = options.timeout ?? Infinity;
  }

  enqueue(...params) {
    const free = this.#count < this.#concurrency;
    const task = { params, error: null, result: null, start: Date.now() };
    if (free) return void this.next(task);
    this.#waiting.push(task);
  }

  process(callback) {
    this.#callback = callback;
    return this;
  }

  next(task) {
    const callback = this.#callback;
    if (!callback) throw new Error('No process callback');
    this.#count++;
    const promises = [Promise.try(callback, task)];
    if (this.#timeout !== Infinity) promises.push(this.#timer(task));
    Promise.race(promises)
      .then(
        result => void (task.result = result),
        error => void (task.error = error),
      )
      .finally(() => void this.finish(task));
  }

  #timer(task) {
    const { promise, reject, } = Promise.withResolvers();
    setTimeout(
      () => void reject(new Error('Processing timeout')),
      this.#timeout,
    );
    return promise;
  }

  expired(task) {
    const wait = this.#wait;
    if (wait === Infinity) return false;
    const delay = Date.now() - task.start;
    if (delay <= wait) return false;
    task.error = new Error('Waiting timeout');
    return true;
  }

  take() {
    const task = this.#waiting.shift();
    if (this.expired(task)) nextTick(() => void this.finish(task));
    else this.next(task);
  }

  finish(task) {
    this.#count--;
    const emit = this.emit;
    if (task.error !== null) emit.call(this, 'error', task);
    else emit.call(this, 'success', task);
    emit.call(this, 'done', task);
    if (this.#waiting.length > 0) this.take();
    else if (this.#count === 0) emit.call(this, 'drain');
  }

  get waiting() {
    return this.#waiting.length;
  }

  get free() {
    return this.#concurrency - this.#count;
  }
}

module.exports = Queue;