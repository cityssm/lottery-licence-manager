import * as assert from "assert";
import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../data/databasePaths.js";
import { fakeViewOnlySession } from "./_globals.js";
import { getLicence } from "../helpers/licencesDB/getLicence.js";
import { getLicences } from "../helpers/licencesDB/getLicences.js";
import { getDistinctTermsConditions } from "../helpers/licencesDB/getDistinctTermsConditions.js";
import { getLicenceActivityByDateRange } from "../helpers/licencesDB/getLicenceActivityByDateRange.js";
import { getNextExternalLicenceNumberFromRange } from "../helpers/licencesDB/getNextExternalLicenceNumberFromRange.js";
import { getLicenceTicketTypesWithDB } from "../helpers/licencesDB/getLicenceTicketTypes.js";
import { getLicenceAmendmentsWithDB } from "../helpers/licencesDB/getLicenceAmendments.js";
import { getMaxLicenceAmendmentIndexWithDB } from "../helpers/licencesDB/getMaxLicenceAmendmentIndex.js";
import { getMaxTransactionIndexWithDB } from "../helpers/licencesDB/getMaxTransactionIndex.js";
describe("licencesDB/licences", () => {
    it("should execute getLicence()", () => {
        assert.strictEqual(getLicence(-1, fakeViewOnlySession), undefined);
    });
    it("should execute getDistinctTermsConditions()", () => {
        assert.strictEqual(typeof getDistinctTermsConditions(-1), "object");
    });
    it("should execute getLicenceActivityByDateRange()", () => {
        assert.strictEqual(getLicenceActivityByDateRange(20200101, 20201231).startDateString, "2020-01-01");
    });
    it("should execute getNextExternalLicenceNumberFromRange()", () => {
        assert.strictEqual(typeof getNextExternalLicenceNumberFromRange(), "number");
    });
    describe("licencesDB/getLicences", () => {
        it("should execute getLicences()", () => {
            assert.strictEqual(typeof getLicences({}, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
        it("should execute getLicences({licenceTypeKey})", () => {
            assert.strictEqual(typeof getLicences({ licenceTypeKey: "NV" }, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
        it("should execute getLicences({licenceStatus})", () => {
            assert.strictEqual(typeof getLicences({ licenceStatus: "active" }, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
        it("should execute getLicences({locationID})", () => {
            assert.strictEqual(typeof getLicences({ locationID: 1 }, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
        it("should execute getLicences({locationName})", () => {
            assert.strictEqual(typeof getLicences({ locationName: "Test" }, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
        it("should execute getLicences({organizationID})", () => {
            assert.strictEqual(typeof getLicences({ organizationID: 1 }, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
        it("should execute getLicences({organizationName})", () => {
            assert.strictEqual(typeof getLicences({ organizationName: "Test" }, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }), "object");
        });
    });
    describe("licencesDB/licences (with DB)", () => {
        let database;
        before(() => {
            database = sqlite(databasePath);
        });
        after(() => {
            database.close();
        });
        it("should execute getLicenceAmendmentsWithDB()", () => {
            assert.strictEqual(typeof getLicenceAmendmentsWithDB(database, 1), "object");
        });
        it("should execute getLicenceTicketTypesWithDB()", () => {
            assert.strictEqual(typeof getLicenceTicketTypesWithDB(database, 1), "object");
        });
        it("should execute getMaxLicenceAmendmentIndexWithDB()", () => {
            assert.strictEqual(getMaxLicenceAmendmentIndexWithDB(database, -1), -1);
        });
        it("should execute getMaxTransactionIndexWithDB()", () => {
            assert.strictEqual(getMaxTransactionIndexWithDB(database, -1), -1);
        });
    });
});
