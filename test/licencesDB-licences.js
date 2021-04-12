"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../data/databasePaths");
const _globals_1 = require("./_globals");
const getLicence_1 = require("../helpers/licencesDB/getLicence");
const getLicences_1 = require("../helpers/licencesDB/getLicences");
const getDistinctTermsConditions_1 = require("../helpers/licencesDB/getDistinctTermsConditions");
const getLicenceActivityByDateRange_1 = require("../helpers/licencesDB/getLicenceActivityByDateRange");
const getNextExternalLicenceNumberFromRange_1 = require("../helpers/licencesDB/getNextExternalLicenceNumberFromRange");
const getLicenceTicketTypes_1 = require("../helpers/licencesDB/getLicenceTicketTypes");
const getLicenceAmendments_1 = require("../helpers/licencesDB/getLicenceAmendments");
const getMaxLicenceAmendmentIndex_1 = require("../helpers/licencesDB/getMaxLicenceAmendmentIndex");
const getMaxTransactionIndex_1 = require("../helpers/licencesDB/getMaxTransactionIndex");
describe("licencesDB/licences", () => {
    it("should execute getLicence()", () => {
        assert.equal(getLicence_1.getLicence(-1, _globals_1.fakeViewOnlySession), null);
    });
    it("should execute getDistinctTermsConditions()", () => {
        assert.equal(typeof getDistinctTermsConditions_1.getDistinctTermsConditions(-1), "object");
    });
    it("should execute getLicenceActivityByDateRange()", () => {
        assert.equal(getLicenceActivityByDateRange_1.getLicenceActivityByDateRange(20200101, 20201231).startDateString, "2020-01-01");
    });
    it("should execute getNextExternalLicenceNumberFromRange()", () => {
        assert.equal(typeof getNextExternalLicenceNumberFromRange_1.getNextExternalLicenceNumberFromRange(), "number");
    });
    describe("licencesDB/getLicences", () => {
        it("should execute getLicences()", () => {
            assert.equal(typeof getLicences_1.getLicences({}, _globals_1.fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
        it("should execute getLicences({licenceTypeKey})", () => {
            assert.equal(typeof getLicences_1.getLicences({ licenceTypeKey: "NV" }, _globals_1.fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
        it("should execute getLicences({licenceStatus})", () => {
            assert.equal(typeof getLicences_1.getLicences({ licenceStatus: "active" }, _globals_1.fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
        it("should execute getLicences({locationID})", () => {
            assert.equal(typeof getLicences_1.getLicences({ locationID: 1 }, _globals_1.fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
        it("should execute getLicences({locationName})", () => {
            assert.equal(typeof getLicences_1.getLicences({ locationName: "Test" }, _globals_1.fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
        it("should execute getLicences({organizationID})", () => {
            assert.equal(typeof getLicences_1.getLicences({ organizationID: 1 }, _globals_1.fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
        it("should execute getLicences({organizationName})", () => {
            assert.equal(typeof getLicences_1.getLicences({ organizationName: "Test" }, _globals_1.fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
    });
    describe("licencesDB/licences (with DB)", () => {
        let db;
        before(() => {
            db = sqlite(databasePaths_1.licencesDB);
        });
        after(() => {
            db.close();
        });
        it("should execute getLicenceAmendmentsWithDB()", () => {
            assert.equal(typeof getLicenceAmendments_1.getLicenceAmendmentsWithDB(db, 1), "object");
        });
        it("should execute getLicenceTicketTypesWithDB()", () => {
            assert.equal(typeof getLicenceTicketTypes_1.getLicenceTicketTypesWithDB(db, 1), "object");
        });
        it("should execute getMaxLicenceAmendmentIndexWithDB()", () => {
            assert.equal(getMaxLicenceAmendmentIndex_1.getMaxLicenceAmendmentIndexWithDB(db, -1), -1);
        });
        it("should execute getMaxTransactionIndexWithDB()", () => {
            assert.equal(getMaxTransactionIndex_1.getMaxTransactionIndexWithDB(db, -1), -1);
        });
    });
});
