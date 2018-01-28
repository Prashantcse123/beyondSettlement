"use strict";

var expect = require("expect.js");

describe("models/index", () => {
  it("returns the task model", () => {
    var models = require("../../models");
    expect(models.Task).to.be.ok();
  });

  it("returns the user model", () => {
    var models = require("../../models");
    expect(models.User).to.be.ok();
  });
});
