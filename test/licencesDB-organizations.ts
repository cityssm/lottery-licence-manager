import * as assert from "assert";

import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../data/databasePaths";

import { fakeViewOnlySession } from "./_globals";

import { getOrganization } from "../helpers/licencesDB/getOrganization";
import { getOrganizations } from "../helpers/licencesDB/getOrganizations";
import { getInactiveOrganizations } from "../helpers/licencesDB/getInactiveOrganizations";

import { getOrganizationRemark } from "../helpers/licencesDB/getOrganizationRemark";
import { getOrganizationRemarks } from "../helpers/licencesDB/getOrganizationRemarks";

import { getOrganizationReminder } from "../helpers/licencesDB/getOrganizationReminder";
import { getOrganizationReminders } from "../helpers/licencesDB/getOrganizationReminders";
import { getUndismissedOrganizationReminders } from "../helpers/licencesDB/getUndismissedOrganizationReminders";

import { getOrganizationBankRecords } from "../helpers/licencesDB/getOrganizationBankRecords";
import { getOrganizationBankRecordStats } from "../helpers/licencesDB/getOrganizationBankRecordStats";

import { getMaxOrganizationReminderIndexWithDB } from "../helpers/licencesDB/getMaxOrganizationReminderIndex";
import { getMaxOrganizationRemarkIndexWithDB } from "../helpers/licencesDB/getMaxOrganizationRemarkIndex";
import { getMaxOrganizationBankRecordIndexWithDB } from "../helpers/licencesDB/getMaxOrganizationBankRecordIndex";


describe("licencesDB/organizations", () => {

  it("should execute getOrganization()", () => {
    assert.equal(getOrganization(-1, fakeViewOnlySession), null);
  });

  it("should execute getOrganizations()", () => {
    assert.equal(typeof getOrganizations({}, fakeViewOnlySession, { limit: 10 }), "object");
  });

  it("should execute getInactiveOrganizations()", () => {
    assert.equal(typeof getInactiveOrganizations(5), "object");
  });

  it("should execute getOrganizationRemark()", () => {
    assert.equal(typeof getOrganizationRemark(-1, -1, fakeViewOnlySession), "undefined");
  });

  it("should execute getOrganizationRemarks()", () => {
    assert.equal(typeof getOrganizationRemarks(1, fakeViewOnlySession), "object");
  });

  it("should execute getOrganizationReminder()", () => {
    assert.equal(typeof getOrganizationReminder(1, 0, fakeViewOnlySession), "undefined");
  });

  it("should execute getOrganizationReminders()", () => {
    assert.equal(typeof getOrganizationReminders(1, fakeViewOnlySession), "object");
  });

  it("should execute getUndismissedOrganizationReminders()", () => {
    assert.equal(typeof getUndismissedOrganizationReminders(fakeViewOnlySession), "object");
  });

  it("should execute getOrganizationBankRecords()", () => {
    assert.equal(typeof getOrganizationBankRecords(1, "", 2020), "object");
  });

  it("should execute getOrganizationBankRecordStats()", () => {
    assert.equal(typeof getOrganizationBankRecordStats(1), "object");
  });

  describe("licencesDB/organizations (with DB)", () => {

    let db: sqlite.Database;

    before(() => {
      db = sqlite(dbPath);
    });

    after(() => {
      db.close();
    });

    it("should execute getMaxOrganizationReminderIndexWithDB()", () => {
      assert.equal(getMaxOrganizationReminderIndexWithDB(db, -1), -1);
    });

    it("should execute getMaxOrganizationRemarkIndexWithDB()", () => {
      assert.equal(getMaxOrganizationRemarkIndexWithDB(db, -1), -1);
    });

    it("should execute getMaxOrganizationBankRecordIndexWithDB()", () => {
      assert.equal(getMaxOrganizationBankRecordIndexWithDB(db, -1), -1);
    });
  });
});
