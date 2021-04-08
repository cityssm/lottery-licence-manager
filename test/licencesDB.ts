import * as assert from "assert";

import { fakeViewOnlySession } from "./_globals";

import { getApplicationSetting } from "../helpers/licencesDB/getApplicationSetting";
import { getApplicationSettings } from "../helpers/licencesDB/getApplicationSettings";

import { getDashboardStats } from "../helpers/licencesDB/getDashboardStats";

import { getEvent } from "../helpers/licencesDB/getEvent";
import { getEvents } from "../helpers/licencesDB/getEvents";
import { getEventFinancialSummary } from "../helpers/licencesDB/getEventFinancialSummary";
import { getOutstandingEvents } from "../helpers/licencesDB/getOutstandingEvents";
import { getPastEventBankingInformation } from "../helpers/licencesDB/getPastEventBankingInformation";

import { getLicence } from "../helpers/licencesDB/getLicence";
import { getLicences } from "../helpers/licencesDB/getLicences";
import { getDistinctTermsConditions } from "../helpers/licencesDB/getDistinctTermsConditions";
import { getNextExternalLicenceNumberFromRange } from "../helpers/licencesDB/getNextExternalLicenceNumberFromRange";

import { getLocation } from "../helpers/licencesDB/getLocation";
import { getLocations } from "../helpers/licencesDB/getLocations";
import { getInactiveLocations } from "../helpers/licencesDB/getInactiveLocations";

import { getOrganization } from "../helpers/licencesDB/getOrganization";
import { getOrganizations } from "../helpers/licencesDB/getOrganizations";

import { getOrganizationRemark } from "../helpers/licencesDB/getOrganizationRemark";
import { getOrganizationRemarks } from "../helpers/licencesDB/getOrganizationRemarks";

import { getOrganizationReminder } from "../helpers/licencesDB/getOrganizationReminder";
import { getOrganizationReminders } from "../helpers/licencesDB/getOrganizationReminders";
import { getUndismissedOrganizationReminders } from "../helpers/licencesDB/getUndismissedOrganizationReminders";


describe("licencesDB", () => {

  it("should execute getApplicationSetting()", () => {
    assert.equal(getApplicationSetting("~~FAKE SETTING~~"), "");
  });

  it("should execute getApplicationSettings()", () => {
    assert.equal(typeof getApplicationSettings(), "object");
  });

  it("should execute getDashboardStats()", () => {
    assert.equal(typeof getDashboardStats(), "object");
  });

  it("should execute getEvent()", () => {
    assert.equal(getEvent(-1, -1, fakeViewOnlySession), null);
  });

  it("should execute getEvents()", () => {
    assert.equal(typeof getEvents({}, fakeViewOnlySession), "object");
  });

  it("should execute getEventFinancialSummary()", () => {
    assert.equal(typeof getEventFinancialSummary({
      eventDateStartString: "2021-01-01",
      eventDateEndString: "2021-12-31"
    }), "object");
  });

  it("should execute getOutstandingEvents()", () => {
    assert.equal(typeof getOutstandingEvents({}, fakeViewOnlySession), "object");
  });

  it("should execute getPastEventBankingInformation()", () => {
    assert.equal(typeof getPastEventBankingInformation(-1), "object");
  });

  it("should execute getLicence()", () => {
    assert.equal(getLicence(-1, fakeViewOnlySession), null);
  });

  it("should execute getLicences()", () => {
    assert.equal(typeof getLicences({}, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
  });

  it("should execute getDistinctTermsConditions()", () => {
    assert.equal(typeof getDistinctTermsConditions(-1), "object");
  });

  it("should execute getNextExternalLicenceNumberFromRange()", () => {
    assert.equal(typeof getNextExternalLicenceNumberFromRange(), "number");
  });

  it("should execute getLocation()", () => {
    assert.equal(getLocation(-1, fakeViewOnlySession), null);
  });

  it("should execute getLocations()", () => {
    assert.equal(typeof getLocations(fakeViewOnlySession, { limit: 10, offset: 0, locationIsDistributor: 0, locationIsManufacturer: 0 }), "object");
  });

  it("should execute getInactiveLocations()", () => {
    assert.equal(typeof getInactiveLocations(5), "object");
  });

  it("should execute getOrganization()", () => {
    assert.equal(getOrganization(-1, fakeViewOnlySession), null);
  });

  it("should execute getOrganizations()", () => {
    assert.equal(typeof getOrganizations({}, fakeViewOnlySession, { limit: 10 }), "object");
  });

  it("should execute getOrganizationRemark()", () => {
    assert.equal(typeof getOrganizationRemark(-1, -1, fakeViewOnlySession), "undefined");
  });

  it("should execute getOrganizationRemarks()", () => {
    assert.equal(typeof getOrganizationRemarks(-1, fakeViewOnlySession), "object");
  });

  it("should execute getOrganizationReminder()", () => {
    assert.equal(typeof getOrganizationReminder(-1, -1, fakeViewOnlySession), "undefined");
  });

  it("should execute getOrganizationReminders()", () => {
    assert.equal(typeof getOrganizationReminders(-1, fakeViewOnlySession), "object");
  });

  it("should execute getUndismissedOrganizationReminders()", () => {
    assert.equal(typeof getUndismissedOrganizationReminders(fakeViewOnlySession), "object");
  });
});
