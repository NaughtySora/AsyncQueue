"use strict";

const tests = ["queue", "round-robin"];

for (const test of tests) require(`./${test}.js`);
