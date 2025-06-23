"use strict";

const AbstractQueue = require("./lib/AbstractQueue.js");
const Queue = require("./lib/Queue.js");
const RoundRobinQueue = require("./lib/RoundRobinQueue.js");

module.exports = Object.freeze({
  Queue,
  AbstractQueue,
  RoundRobinQueue,
});
