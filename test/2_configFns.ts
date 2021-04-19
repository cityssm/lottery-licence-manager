import * as assert from "assert";

import * as configFns from "../helpers/configFns.js";


describe("configFns", () => {

  describe("#getProperty", () => {
    it("Includes string value for property \"licences.externalLicenceNumber.fieldLabel\"", () => {
      assert.equal(typeof configFns.getProperty("licences.externalLicenceNumber.fieldLabel"), "string");
    });
  });

  it("getReminderType()", () => {
    assert.equal(configFns.getReminderType(""), null);
  });

  it("getLicenceType()", () => {
    assert.equal(configFns.getLicenceType(""), null);
  });

  it("getLicenceTypeKeyToNameObject()", () => {
    assert.ok(configFns.getLicenceTypeKeyToNameObject());
  });
});
