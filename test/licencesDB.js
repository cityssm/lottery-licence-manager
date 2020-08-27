"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _globals_1 = require("./_globals");
const licencesDB_getApplicationSetting = require("../helpers/licencesDB/getApplicationSetting");
const licencesDB_getEvent = require("../helpers/licencesDB/getEvent");
const licencesDB_getInactiveLocations = require("../helpers/licencesDB/getInactiveLocations");
const licencesDB_getLicence = require("../helpers/licencesDB/getLicence");
const licencesDB_getLicences = require("../helpers/licencesDB/getLicences");
const licencesDB_getLocation = require("../helpers/licencesDB/getLocation");
const licencesDB_getLocations = require("../helpers/licencesDB/getLocations");
describe("licencesDB", () => {
    it("should execute getApplicationSetting()", () => {
        assert.equal(licencesDB_getApplicationSetting.getApplicationSetting("~~FAKE SETTING~~"), "");
    });
    it("should execute getEvent()", () => {
        assert.equal(licencesDB_getEvent.getEvent(-1, -1, _globals_1.fakeViewOnlySession), null);
    });
    it("should execute getInactiveLocations()", () => {
        assert.equal(typeof licencesDB_getInactiveLocations.getInactiveLocations(5), "object");
    });
    it("should execute getLicence()", () => {
        assert.equal(licencesDB_getLicence.getLicence(-1, _globals_1.fakeViewOnlySession), null);
    });
    it("should execute getLicences()", () => {
        assert.equal(typeof licencesDB_getLicences.getLicences({}, _globals_1.fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
    });
    it("should execute getLocation()", () => {
        assert.equal(licencesDB_getLocation.getLocation(-1, _globals_1.fakeViewOnlySession), null);
    });
    it("should execute getLocations()", () => {
        assert.equal(typeof licencesDB_getLocations.getLocations(_globals_1.fakeViewOnlySession, { limit: 10, offset: 0, locationIsDistributor: 0, locationIsManufacturer: 0 }), "object");
    });
});
