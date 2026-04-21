'use strict';

const JOBS = [
  { interval: 313 }, { interval: 274 }, { interval: 825 }, { interval: 77 },
  { interval: 232 }, { interval: 86 }, { interval: 746 }, { interval: 798 },
  { interval: 596 }, { interval: 840 }, { interval: 214 }, { interval: 408 },
  { interval: 122 }, { interval: 13 }, { interval: 320 }, { interval: 427 },
  { interval: 495 }, { interval: 480 }, { interval: 318 }, { interval: 891 },
  { interval: 30 }, { interval: 593 }, { interval: 330 }, { interval: 744 },
  { interval: 626 }, { interval: 842 }, { interval: 61 }, { interval: 762 },
  { interval: 253 }, { interval: 808 }, { interval: 584 }, { interval: 706 },
  { interval: 787 }, { interval: 893 }, { interval: 585 }, { interval: 22 },
  { interval: 153 }, { interval: 403 }, { interval: 701 }, { interval: 766 },
  { interval: 361 }, { interval: 709 }, { interval: 221 }, { interval: 179 },
  { interval: 906 }, { interval: 151 }, { interval: 706 }, { interval: 481 },
  { interval: 862 }, { interval: 331 }, { interval: 948 }, { interval: 955 },
  { interval: 921 }, { interval: 949 }, { interval: 291 }, { interval: 270 },
  { interval: 271 }, { interval: 952 }, { interval: 102 }, { interval: 103 },
  { interval: 851 }, { interval: 220 }, { interval: 15 }, { interval: 544 },
  { interval: 506 }, { interval: 951 }, { interval: 462 }, { interval: 541 },
  { interval: 65 }, { interval: 715 }, { interval: 569 }, { interval: 293 },
  { interval: 982 }, { interval: 862 }, { interval: 240 }, { interval: 596 },
  { interval: 507 }, { interval: 504 }, { interval: 303 }, { interval: 652 },
  { interval: 354 }, { interval: 783 }, { interval: 878 }, { interval: 685 },
  { interval: 503 }, { interval: 337 }, { interval: 968 }, { interval: 515 },
  { interval: 898 }, { interval: 226 }, { interval: 405 }, { interval: 970 },
  { interval: 291 }, { interval: 677 }, { interval: 658 }, { interval: 362 },
  { interval: 331 }, { interval: 33 }, { interval: 998 }, { interval: 89 }
];

const counters = (...names) => {
  const counters = {};
  for (const name of names) counters[name] = 0;
  return {
    inc(name) {
      counters[name]++;
    },
    get(name) {
      return counters[name];
    },
    counters,
  };
};

const events = counters.bind(null, "success", "error", "drain");

module.exports = { events, counters, JOBS };