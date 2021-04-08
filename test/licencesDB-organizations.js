"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _globals_1 = require("./_globals");
const getOrganization_1 = require("../helpers/licencesDB/getOrganization");
const getOrganizations_1 = require("../helpers/licencesDB/getOrganizations");
const getOrganizationRemark_1 = require("../helpers/licencesDB/getOrganizationRemark");
const getOrganizationRemarks_1 = require("../helpers/licencesDB/getOrganizationRemarks");
const getOrganizationReminder_1 = require("../helpers/licencesDB/getOrganizationReminder");
const getOrganizationReminders_1 = require("../helpers/licencesDB/getOrganizationReminders");
const getUndismissedOrganizationReminders_1 = require("../helpers/licencesDB/getUndismissedOrganizationReminders");
describe("licencesDB/organizations", () => {
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
