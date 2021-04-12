"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../data/databasePaths");
const _globals_1 = require("./_globals");
const getOrganization_1 = require("../helpers/licencesDB/getOrganization");
const getOrganizations_1 = require("../helpers/licencesDB/getOrganizations");
const getInactiveOrganizations_1 = require("../helpers/licencesDB/getInactiveOrganizations");
const getOrganizationRemark_1 = require("../helpers/licencesDB/getOrganizationRemark");
const getOrganizationRemarks_1 = require("../helpers/licencesDB/getOrganizationRemarks");
const getOrganizationReminder_1 = require("../helpers/licencesDB/getOrganizationReminder");
const getOrganizationReminders_1 = require("../helpers/licencesDB/getOrganizationReminders");
const getUndismissedOrganizationReminders_1 = require("../helpers/licencesDB/getUndismissedOrganizationReminders");
const getOrganizationBankRecords_1 = require("../helpers/licencesDB/getOrganizationBankRecords");
const getMaxOrganizationReminderIndex_1 = require("../helpers/licencesDB/getMaxOrganizationReminderIndex");
const getMaxOrganizationRemarkIndex_1 = require("../helpers/licencesDB/getMaxOrganizationRemarkIndex");
const getMaxOrganizationBankRecordIndex_1 = require("../helpers/licencesDB/getMaxOrganizationBankRecordIndex");
describe("licencesDB/organizations", () => {
    it("should execute getOrganization()", () => {
        assert.equal(getOrganization_1.getOrganization(-1, _globals_1.fakeViewOnlySession), null);
    });
    it("should execute getOrganizations()", () => {
        assert.equal(typeof getOrganizations_1.getOrganizations({}, _globals_1.fakeViewOnlySession, { limit: 10 }), "object");
    });
    it("should execute getInactiveOrganizations()", () => {
        assert.equal(typeof getInactiveOrganizations_1.getInactiveOrganizations(5), "object");
    });
    it("should execute getOrganizationRemark()", () => {
        assert.equal(typeof getOrganizationRemark_1.getOrganizationRemark(-1, -1, _globals_1.fakeViewOnlySession), "undefined");
    });
    it("should execute getOrganizationRemarks()", () => {
        assert.equal(typeof getOrganizationRemarks_1.getOrganizationRemarks(1, _globals_1.fakeViewOnlySession), "object");
    });
    it("should execute getOrganizationReminder()", () => {
        assert.equal(typeof getOrganizationReminder_1.getOrganizationReminder(1, 0, _globals_1.fakeViewOnlySession), "undefined");
    });
    it("should execute getOrganizationReminders()", () => {
        assert.equal(typeof getOrganizationReminders_1.getOrganizationReminders(1, _globals_1.fakeViewOnlySession), "object");
    });
    it("should execute getUndismissedOrganizationReminders()", () => {
        assert.equal(typeof getUndismissedOrganizationReminders_1.getUndismissedOrganizationReminders(_globals_1.fakeViewOnlySession), "object");
    });
    it("should execute getOrganizationBankRecords()", () => {
        assert.equal(typeof getOrganizationBankRecords_1.getOrganizationBankRecords(1, "", 2020), "object");
    });
    describe("licencesDB/organizations (with DB)", () => {
        let db;
        before(() => {
            db = sqlite(databasePaths_1.licencesDB);
        });
        after(() => {
            db.close();
        });
        it("should execute getMaxOrganizationReminderIndexWithDB()", () => {
            assert.equal(getMaxOrganizationReminderIndex_1.getMaxOrganizationReminderIndexWithDB(db, -1), -1);
        });
        it("should execute getMaxOrganizationRemarkIndexWithDB()", () => {
            assert.equal(getMaxOrganizationRemarkIndex_1.getMaxOrganizationRemarkIndexWithDB(db, -1), -1);
        });
        it("should execute getMaxOrganizationBankRecordIndexWithDB()", () => {
            assert.equal(getMaxOrganizationBankRecordIndex_1.getMaxOrganizationBankRecordIndexWithDB(db, -1), -1);
        });
    });
});
