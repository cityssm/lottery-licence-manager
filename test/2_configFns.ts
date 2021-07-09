import * as assert from "assert";

import * as configFunctions from "../helpers/functions.config.js";


describe("configFunctions", () => {

  describe("#getProperty", () => {
    it("Includes string value for property \"licences.externalLicenceNumber.fieldLabel\"", () => {
      assert.equal(typeof configFunctions.getProperty("licences.externalLicenceNumber.fieldLabel"), "string");
    });
  });

  it("getReminderType()", () => {
    assert.equal(configFunctions.getReminderType(""), null);
  });

  it("getLicenceType()", () => {
    assert.equal(configFunctions.getLicenceType(""), null);
  });

  it("getLicenceTypeKeyToNameObject()", () => {
    assert.ok(configFunctions.getLicenceTypeKeyToNameObject());
  });
});
