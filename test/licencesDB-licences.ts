import * as assert from "assert";

import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../data/databasePaths";

import { fakeViewOnlySession } from "./_globals";

import { getLicence } from "../helpers/licencesDB/getLicence";
import { getLicences } from "../helpers/licencesDB/getLicences";
import { getDistinctTermsConditions } from "../helpers/licencesDB/getDistinctTermsConditions";
import { getLicenceActivityByDateRange } from "../helpers/licencesDB/getLicenceActivityByDateRange";
import { getNextExternalLicenceNumberFromRange } from "../helpers/licencesDB/getNextExternalLicenceNumberFromRange";

import { getLicenceTicketTypesWithDB } from "../helpers/licencesDB/getLicenceTicketTypes";
import { getLicenceAmendmentsWithDB } from "../helpers/licencesDB/getLicenceAmendments";
import { getMaxLicenceAmendmentIndexWithDB } from "../helpers/licencesDB/getMaxLicenceAmendmentIndex";
import { getMaxTransactionIndexWithDB } from "../helpers/licencesDB/getMaxTransactionIndex";


describe("licencesDB/licences", () => {

  it("should execute getLicence()", () => {
    assert.equal(getLicence(-1, fakeViewOnlySession), null);
  });

  it("should execute getDistinctTermsConditions()", () => {
    assert.equal(typeof getDistinctTermsConditions(-1), "object");
  });

  it("should execute getLicenceActivityByDateRange()", () => {
    assert.equal(getLicenceActivityByDateRange(20200101, 20201231).startDateString, "2020-01-01");
  });

  it("should execute getNextExternalLicenceNumberFromRange()", () => {
    assert.equal(typeof getNextExternalLicenceNumberFromRange(), "number");
  });

  describe("licencesDB/getLicences", () => {

    it("should execute getLicences()", () => {
      assert.equal(
        typeof getLicences({}, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }),
        "object");
    });

    it("should execute getLicences({licenceTypeKey})", () => {
      assert.equal(
        typeof getLicences({ licenceTypeKey: "NV" }, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }),
        "object");
    });

    it("should execute getLicences({licenceStatus})", () => {
      assert.equal(
        typeof getLicences({ licenceStatus: "active" }, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }),
        "object");
    });

    it("should execute getLicences({locationID})", () => {
      assert.equal(
        typeof getLicences({ locationID: 1 }, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }),
        "object");
    });

    it("should execute getLicences({locationName})", () => {
      assert.equal(
        typeof getLicences({ locationName: "Test" }, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }),
        "object");
    });

    it("should execute getLicences({organizationID})", () => {
      assert.equal(
        typeof getLicences({ organizationID: 1 }, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }),
        "object");
    });

    it("should execute getLicences({organizationName})", () => {
      assert.equal(
        typeof getLicences({ organizationName: "Test" }, fakeViewOnlySession, { includeOrganization: true, limit: 10, offset: 0 }),
        "object");
    });
  });

  describe("licencesDB/licences (with DB)", () => {

    let db: sqlite.Database;

    before(() => {
      db = sqlite(dbPath);
    });

    after(() => {
      db.close();
    });

    it("should execute getLicenceAmendmentsWithDB()", () => {
      assert.equal(typeof getLicenceAmendmentsWithDB(db, 1), "object");
    });

    it("should execute getLicenceTicketTypesWithDB()", () => {
      assert.equal(typeof getLicenceTicketTypesWithDB(db, 1), "object");
    });

    it("should execute getMaxLicenceAmendmentIndexWithDB()", () => {
      assert.equal(getMaxLicenceAmendmentIndexWithDB(db, 1), -1);
    });

    it("should execute getMaxTransactionIndexWithDB()", () => {
      assert.equal(getMaxTransactionIndexWithDB(db, 1), -1);
    });
  });
});
