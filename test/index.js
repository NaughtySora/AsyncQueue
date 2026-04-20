"use strict";

// const tests = ["queue", "round-robin"];
const tests = ["queue"];

for (const test of tests) require(`./${test}.js`);
