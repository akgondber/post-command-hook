"use strict";

const execa = require("execa");
const consola = require("consola");
const { isPlainObject } = require("is-plain-object");
const isNil = require("lodash.isnil");
const isString = require("lodash.isstring");
const { throwIf, logIfPresent, isAsync } = require("./utils");

class PostCommandHook {
  constructor(baseCommand, execaOptions = { stdio: "inherit" }) {
    this.baseCommand = baseCommand;
    this.execaOptions = execaOptions;
    this.plugins = [];
  }

  use(plugin) {
    this.plugins.push(plugin);
    return this;
  }

  async run(options = { skipErrors: false }) {
    const { command, args } = this.baseCommand;

    await execa(command, args, this.execaOptions);

    const { skipErrors } = options;
    let plugin;
    let skippedCount = 0;

    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < this.plugins.length; i++) {
      plugin = this.plugins[i];
      try {
        if (isString(plugin)) {
          await execa(plugin, [], this.execaOptions);
        } else if (isPlainObject(plugin)) {
          const { command, args, premessage, postmessage } = plugin;
          if (isNil(command)) {
            throwIf(
              !skipErrors,
              "A plugin object should have required `command` key."
            );
            skippedCount++;
            continue;
          }

          logIfPresent(premessage);
          await execa(command, args, this.execaOptions);
          logIfPresent(postmessage);
        } else if (typeof plugin === "function") {
          if (isAsync(plugin)) {
            await plugin();
          } else {
            plugin();
          }
        } else if (typeof plugin.run === "function") {
          logIfPresent(plugin.premessage);
          if (isAsync(plugin.run)) {
            await plugin.run();
          } else {
            plugin.run();
          }

          logIfPresent(plugin.postmessage);
        } else {
          throwIf(
            !skipErrors,
            "A plugin argument must be an object, function, or instance of class responding to `.run`."
          );
          skippedCount++;
          continue;
        }
      } catch (err) {
        throw err;
      }
    }
    /* eslint-enable no-await-in-loop */

    if (skippedCount === 0) {
      consola.success(`Done! All registered plugins have been succeeded.`);
    } else {
      consola.warn(
        `Some plugins have not been succeeded. Total: ${
          this.plugins.length
        }, succeeded: ${this.plugins.length -
          skippedCount}, failed: ${skippedCount}.`
      );
    }
  }
}

module.exports = PostCommandHook;
