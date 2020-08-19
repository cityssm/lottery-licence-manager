"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const configFns = require("../helpers/configFns");
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
