import * as assert from "assert";

import { fakeRequest, fakeViewOnlyRequest, fakeAdminRequest } from "./_globals.js";

import * as userFunctions from "../helpers/functions.user.js";


describe("functions.user", () => {

  describe("request.session.user = null", () => {

    it("userCanCreate()  => false", () => {
      assert.strictEqual(userFunctions.userCanCreate(fakeRequest), false);
    });

    it("userCanUpdate()  => false", () => {
      assert.strictEqual(userFunctions.userCanUpdate(fakeRequest), false);
    });

    it("userIsAdmin()    => false", () => {
      assert.strictEqual(userFunctions.userIsAdmin(fakeRequest), false);
    });
  });

  describe("request.session.user = viewOnly", () => {

    it("userCanCreate()  => false", () => {
      assert.strictEqual(userFunctions.userCanCreate(fakeViewOnlyRequest), false);
    });

    it("userCanUpdate()  => false", () => {
      assert.strictEqual(userFunctions.userCanUpdate(fakeViewOnlyRequest), false);
    });

    it("userIsAdmin()    => false", () => {
      assert.strictEqual(userFunctions.userIsAdmin(fakeViewOnlyRequest), false);
    });
  });

  describe("request.session.user = admin", () => {

    // Admin

    it("userCanCreate()  => true", () => {
      assert.ok(userFunctions.userCanCreate(fakeAdminRequest));
    });

    it("userCanUpdate()  => true", () => {
      assert.ok(userFunctions.userCanUpdate(fakeAdminRequest));
    });

    it("userIsAdmin()    => true", () => {
      assert.ok(userFunctions.userIsAdmin(fakeAdminRequest));
    });
  });

});
