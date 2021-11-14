const { throwIf, logIfPresent } = require("../utils.js");

describe("throwIf", () => {
  describe("when condition is false", () => {
    it("does not throws an error", () => {
      expect(() => {
        throwIf(false, "Something was wrong");
      }).not.toThrow("Something was wrong");
    });
  });

  describe("when condition is true", () => {
    it("throws an error", () => {
      expect(() => {
        throwIf(true, "Something was wrong");
      }).toThrow("Something was wrong");
    });
  });
});

describe("logIfPresent", () => {
  beforeEach(() => {
    console.log = jest.fn();
  });

  describe("when condition is false", () => {
    it("does not throws an error", () => {
      logIfPresent("aw");
      expect(console.log).toHaveBeenCalledWith("aw");
    });
  });

  describe("when condition is true", () => {
    it("does not log a message ", () => {
      logIfPresent(null);
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
