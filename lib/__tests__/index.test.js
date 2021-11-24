const execa = require("execa");
const consola = require("consola");
const objectHash = require("object-hash");
const Conf = require("conf");

const PostCommandHook = require("../index.js");

consola.pauseLogs();

jest.mock("execa");

const mockGet = jest.fn();
const mockSet = jest.fn();

jest.mock("conf");

describe("postCommandHook", () => {
  let postCommandHook;

  beforeAll(() => {
    Conf.mockImplementation(() => ({
      get: mockGet,
      set: mockSet,
    }));
  });

  beforeEach(() => {
    postCommandHook = new PostCommandHook({ command: "echo", args: ["foo"] });
  });

  describe(".use", () => {
    it("adds plugin", () => {
      postCommandHook.use({ command: "echo", args: ["bar"] });

      expect(postCommandHook.plugins.length).toEqual(1);
    });
  });

  describe(".run", () => {
    describe("when runOnce option is set", () => {
      it("does not execute plugins which are already have been run", async () => {
        postCommandHook.setRunOnce(true);
        postCommandHook.use({ command: "echo", args: ["bar"] });
        await postCommandHook.run();

        /* eslint-disable max-nested-callbacks */
        mockGet.mockImplementation((val) => {
          if (val === "plugins") {
            return [objectHash({ command: "echo", args: ["bar"] })];
          }

          if (val === "runOnce" || val === "baseCommandWasRun") {
            return true;
          }
        });
        /* eslint-enable max-nested-callbacks */

        await postCommandHook.run();

        postCommandHook.use({ command: "npm", args: ["-v"] });
        await postCommandHook.run();

        expect(execa).toHaveBeenNthCalledWith(1, "echo", ["foo"], {
          stdio: "inherit",
        });

        expect(execa).toHaveBeenNthCalledWith(2, "echo", ["bar"], {
          stdio: "inherit",
        });

        expect(execa).toHaveBeenNthCalledWith(3, "npm", ["-v"], {
          stdio: "inherit",
        });
      });
    });

    describe("when all hooks are correct", () => {
      it("executes all registered hooks after base command", async () => {
        const fn = jest.fn();
        /* eslint-disable max-nested-callbacks */
        await postCommandHook
          .use({ command: "echo", args: ["bar"] })
          .use(() => fn())
          .run();
        /* eslint-enable max-nested-callbacks */
        expect(execa).toHaveBeenCalledWith("echo", ["foo"], {
          stdio: "inherit",
        });
        expect(execa).toHaveBeenCalledWith("echo", ["bar"], {
          stdio: "inherit",
        });
        expect(fn).toHaveBeenCalled();
      });
    });

    describe("when plugin is an instance having a .run method", () => {
      const runMock = jest.fn();
      class FooHook {
        run() {
          runMock();
        }
      }

      it("calls the `.run` method of the instance", async () => {
        await postCommandHook.use(new FooHook()).run();
        expect(runMock).toHaveBeenCalled();
      });
    });

    describe("when a `command` key is missing in plugin object", () => {
      it("throws an error", async () => {
        expect.assertions(1);

        try {
          postCommandHook.use({ incorrect: ["bar"] });
          await postCommandHook.run();
        } catch (err) {
          expect(err.message).toEqual(
            "A plugin object should have required `command` key."
          );
        }
      });
    });

    describe("when incorrect parameter was used in the argument", () => {
      it("throws an error", async () => {
        const wrongPluginArgument = 16;

        expect.assertions(1);

        try {
          postCommandHook.use(wrongPluginArgument);
          await postCommandHook.run();
        } catch (err) {
          expect(err.message).toEqual(
            "A plugin argument must be an object, function, or instance of class responding to `.run`."
          );
        }
      });
    });

    describe("when skipErrors option is set to true", () => {
      it("executes all commands which are configured correctly", async () => {
        await postCommandHook
          .use({ incorrect: ["keys"] })
          .use({ command: "echo", args: ["bar"] })
          .run({ skipErrors: true });
        expect(execa).toHaveBeenCalledWith("echo", ["bar"], {
          stdio: "inherit",
        });
      });
    });
  });
});
