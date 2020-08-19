import * as assert from "assert";

import { fakeRequest, fakeViewOnlyRequest, fakeAdminRequest } from "./1_serverStart";

import * as userFns from "../helpers/userFns";


describe("userFns", () => {

  describe("request.session.user = null", () => {

    it("userCanCreate()  => false", () => {
      assert.equal(userFns.userCanCreate(fakeRequest), false);
    });

    it("userCanUpdate()  => false", () => {
      assert.equal(userFns.userCanUpdate(fakeRequest), false);
    });

    it("userIsAdmin()    => false", () => {
      assert.equal(userFns.userIsAdmin(fakeRequest), false);
    });
  });

  describe("request.session.user = viewOnly", () => {

    it("userCanCreate()  => false", () => {
      assert.equal(userFns.userCanCreate(fakeViewOnlyRequest), false);
    });

    it("userCanUpdate()  => false", () => {
      assert.equal(userFns.userCanUpdate(fakeViewOnlyRequest), false);
    });

    it("userIsAdmin()    => false", () => {
      assert.equal(userFns.userIsAdmin(fakeViewOnlyRequest), false);
    });
  });

  describe("request.session.user = admin", () => {

    // Admin

    it("userCanCreate()  => true", () => {
      assert.ok(userFns.userCanCreate(fakeAdminRequest));
    });

    it("userCanUpdate()  => true", () => {
      assert.ok(userFns.userCanUpdate(fakeAdminRequest));
    });

    it("userIsAdmin()    => true", () => {
      assert.ok(userFns.userIsAdmin(fakeAdminRequest));
    });
  });

});
