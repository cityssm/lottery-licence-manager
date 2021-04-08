"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _globals_1 = require("./_globals");
const getApplicationSetting_1 = require("../helpers/licencesDB/getApplicationSetting");
const getApplicationSettings_1 = require("../helpers/licencesDB/getApplicationSettings");
const getDashboardStats_1 = require("../helpers/licencesDB/getDashboardStats");
const getEvent_1 = require("../helpers/licencesDB/getEvent");
const getEvents_1 = require("../helpers/licencesDB/getEvents");
const getEventFinancialSummary_1 = require("../helpers/licencesDB/getEventFinancialSummary");
const getOutstandingEvents_1 = require("../helpers/licencesDB/getOutstandingEvents");
const getPastEventBankingInformation_1 = require("../helpers/licencesDB/getPastEventBankingInformation");
const getLicence_1 = require("../helpers/licencesDB/getLicence");
const getLicences_1 = require("../helpers/licencesDB/getLicences");
const getDistinctTermsConditions_1 = require("../helpers/licencesDB/getDistinctTermsConditions");
const getNextExternalLicenceNumberFromRange_1 = require("../helpers/licencesDB/getNextExternalLicenceNumberFromRange");
const getLocation_1 = require("../helpers/licencesDB/getLocation");
const getLocations_1 = require("../helpers/licencesDB/getLocations");
const getInactiveLocations_1 = require("../helpers/licencesDB/getInactiveLocations");
const getOrganization_1 = require("../helpers/licencesDB/getOrganization");
const getOrganizations_1 = require("../helpers/licencesDB/getOrganizations");
const getOrganizationRemark_1 = require("../helpers/licencesDB/getOrganizationRemark");
const getOrganizationRemarks_1 = require("../helpers/licencesDB/getOrganizationRemarks");
const getOrganizationReminder_1 = require("../helpers/licencesDB/getOrganizationReminder");
const getOrganizationReminders_1 = require("../helpers/licencesDB/getOrganizationReminders");
const getUndismissedOrganizationReminders_1 = require("../helpers/licencesDB/getUndismissedOrganizationReminders");
describe("licencesDB", () => {
    it("should execute getApplicationSetting()", () => {
        assert.equal(getApplicationSetting_1.getApplicationSetting("~~FAKE SETTING~~"), "");
    });
    it("should execute getApplicationSettings()", () => {
        assert.equal(typeof getApplicationSettings_1.getApplicationSettings(), "object");
    });
    it("should execute getDashboardStats()", () => {
        assert.equal(typeof getDashboardStats_1.getDashboardStats(), "object");
    });
    it("should execute getEvent()", () => {
        assert.equal(getEvent_1.getEvent(-1, -1, _globals_1.fakeViewOnlySession), null);
    });
    it("should execute getEvents()", () => {
        assert.equal(typeof getEvents_1.getEvents({}, _globals_1.fakeViewOnlySession), "object");
    });
    it("should execute getEventFinancialSummary()", () => {
        assert.equal(typeof getEventFinancialSummary_1.getEventFinancialSummary({
            eventDateStartString: "2021-01-01",
            eventDateEndString: "2021-12-31"
        }), "object");
    });
    it("should execute getOutstandingEvents()", () => {
        assert.equal(typeof getOutstandingEvents_1.getOutstandingEvents({}, _globals_1.fakeViewOnlySession), "object");
    });
    it("should execute getPastEventBankingInformation()", () => {
        assert.equal(typeof getPastEventBankingInformation_1.getPastEventBankingInformation(-1), "object");
    });
    it("should execute getLicence()", () => {
        assert.equal(getLicence_1.getLicence(-1, _globals_1.fakeViewOnlySession), null);
    });
    it("should execute getLicences()", () => {
        assert.equal(typeof getLicences_1.getLicences({}, _globals_1.fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
    });
    it("should execute getDistinctTermsConditions()", () => {
        assert.equal(typeof getDistinctTermsConditions_1.getDistinctTermsConditions(-1), "object");
    });
    it("should execute getNextExternalLicenceNumberFromRange()", () => {
        assert.equal(typeof getNextExternalLicenceNumberFromRange_1.getNextExternalLicenceNumberFromRange(), "number");
    });
    it("should execute getLocation()", () => {
        assert.equal(getLocation_1.getLocation(-1, _globals_1.fakeViewOnlySession), null);
    });
    it("should execute getLocations()", () => {
        assert.equal(typeof getLocations_1.getLocations(_globals_1.fakeViewOnlySession, { limit: 10, offset: 0, locationIsDistributor: 0, locationIsManufacturer: 0 }), "object");
    });
    it("should execute getInactiveLocations()", () => {
        assert.equal(typeof getInactiveLocations_1.getInactiveLocations(5), "object");
    });
    it("should execute getOrganization()", () => {
        assert.equal(getOrganization_1.getOrganization(-1, _globals_1.fakeViewOnlySession), null);
    });
    it("should execute getOrganizations()", () => {
        assert.equal(typeof getOrganizations_1.getOrganizations({}, _globals_1.fakeViewOnlySession, { limit: 10 }), "object");
    });
    it("should execute getOrganizationRemark()", () => {
        assert.equal(typeof getOrganizationRemark_1.getOrganizationRemark(-1, -1, _globals_1.fakeViewOnlySession), "undefined");
    });
    it("should execute getOrganizationRemarks()", () => {
        assert.equal(typeof getOrganizationRemarks_1.getOrganizationRemarks(-1, _globals_1.fakeViewOnlySession), "object");
    });
    it("should execute getOrganizationReminder()", () => {
        assert.equal(typeof getOrganizationReminder_1.getOrganizationReminder(-1, -1, _globals_1.fakeViewOnlySession), "undefined");
    });
    it("should execute getOrganizationReminders()", () => {
        assert.equal(typeof getOrganizationReminders_1.getOrganizationReminders(-1, _globals_1.fakeViewOnlySession), "object");
    });
    it("should execute getUndismissedOrganizationReminders()", () => {
        assert.equal(typeof getUndismissedOrganizationReminders_1.getUndismissedOrganizationReminders(_globals_1.fakeViewOnlySession), "object");
    });
});
