"use strict";

const { EventEmitter } = require("node:events");

class AbstractQueue extends EventEmitter {
  constructor() {
    super();
    if (this.constructor === AbstractQueue) {
      throw new Error("Can't make instance of an abstract class");
    }
  }

  enqueue() {
    throw new Error("Method is not implemented");
  }

  process() {
    throw new Error("Method is not implemented");
  }
}

module.exports = AbstractQueue;
