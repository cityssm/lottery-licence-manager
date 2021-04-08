"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _globals_1 = require("./_globals");
const getLocation_1 = require("../helpers/licencesDB/getLocation");
const getLocations_1 = require("../helpers/licencesDB/getLocations");
const getInactiveLocations_1 = require("../helpers/licencesDB/getInactiveLocations");
describe("licencesDB/locations", () => {
    it("should execute getLocation()", () => {
        assert.equal(getLocation_1.getLocation(-1, _globals_1.fakeViewOnlySession), null);
    });
    it("should execute getLocations()", () => {
        assert.equal(typeof getLocations_1.getLocations(_globals_1.fakeViewOnlySession, { limit: 10, offset: 0, locationIsDistributor: 0, locationIsManufacturer: 0 }), "object");
    });
    it("should execute getInactiveLocations()", () => {
        assert.equal(typeof getInactiveLocations_1.getInactiveLocations(5), "object");
    });
});
