"use strict";

// const tests = ["queue", "round-robin"];
const tests = ["round-robin"];

for (const test of tests) require(`./${test}.js`);
