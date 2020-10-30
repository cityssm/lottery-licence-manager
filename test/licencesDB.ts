import * as assert from "assert";

import { fakeViewOnlySession } from "./_globals";

import * as licencesDB_getApplicationSetting from "../helpers/licencesDB/getApplicationSetting";
import * as licencesDB_getEvent from "../helpers/licencesDB/getEvent";
import * as licencesDB_getInactiveLocations from "../helpers/licencesDB/getInactiveLocations";
import * as licencesDB_getLicence from "../helpers/licencesDB/getLicence";
import * as licencesDB_getLicences from "../helpers/licencesDB/getLicences";
import * as licencesDB_getLocation from "../helpers/licencesDB/getLocation";
import * as licencesDB_getLocations from "../helpers/licencesDB/getLocations";
import * as licencesDB_getOrganization from "../helpers/licencesDB/getOrganization";
import * as licencesDB_getOrganizations from "../helpers/licencesDB/getOrganizations";


describe("licencesDB", () => {

  it("should execute getApplicationSetting()", () => {
    assert.equal(licencesDB_getApplicationSetting.getApplicationSetting("~~FAKE SETTING~~"), "");
  });

  it("should execute getEvent()", () => {
    assert.equal(licencesDB_getEvent.getEvent(-1, -1, fakeViewOnlySession), null);
  });

  it("should execute getInactiveLocations()", () => {
    assert.equal(typeof licencesDB_getInactiveLocations.getInactiveLocations(5), "object");
  });

  it("should execute getLicence()", () => {
    assert.equal(licencesDB_getLicence.getLicence(-1, fakeViewOnlySession), null);
  });

  it("should execute getLicences()", () => {
    assert.equal(typeof licencesDB_getLicences.getLicences({}, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
  });

  it("should execute getLocation()", () => {
    assert.equal(licencesDB_getLocation.getLocation(-1, fakeViewOnlySession), null);
  });

  it("should execute getLocations()", () => {
    assert.equal(typeof licencesDB_getLocations.getLocations(fakeViewOnlySession, { limit: 10, offset: 0, locationIsDistributor: 0, locationIsManufacturer: 0 }), "object");
  });

  it("should execute getOrganization()", () => {
    assert.equal(licencesDB_getOrganization.getOrganization(-1, fakeViewOnlySession), null);
  });

  it("should execute getOrganizations()", () => {
    assert.equal(typeof licencesDB_getOrganizations.getOrganizations({}, fakeViewOnlySession, { limit: 10 }), "object");
  });
});
