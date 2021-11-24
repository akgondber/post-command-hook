"use strict";

const isNil = require("lodash.isnil");

const throwIf = (condition, msg) => {
  if (condition) {
    throw new Error(msg);
  }
};

const logIfPresent = (messageOrFunc) => {
  if (isNil(messageOrFunc)) {
    return;
  }

  if (typeof messageOrFunc === "function") {
    console.log(messageOrFunc());
  } else {
    console.log(messageOrFunc);
  }
};

const isAsync = (func) => func.constructor.name === "AsyncFunction";

module.exports = {
  throwIf,
  logIfPresent,
  isAsync,
};
