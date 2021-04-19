import * as assert from "assert";

import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../data/databasePaths.js";

import { fakeViewOnlySession } from "./_globals.js";

import { getOrganization } from "../helpers/licencesDB/getOrganization.js";
import { getOrganizations } from "../helpers/licencesDB/getOrganizations.js";
import { getInactiveOrganizations } from "../helpers/licencesDB/getInactiveOrganizations.js";

import { getOrganizationRemark } from "../helpers/licencesDB/getOrganizationRemark.js";
import { getOrganizationRemarks } from "../helpers/licencesDB/getOrganizationRemarks.js";

import { getOrganizationReminder } from "../helpers/licencesDB/getOrganizationReminder.js";
import { getOrganizationReminders } from "../helpers/licencesDB/getOrganizationReminders.js";
import { getUndismissedOrganizationReminders } from "../helpers/licencesDB/getUndismissedOrganizationReminders.js";

import { getOrganizationBankRecords } from "../helpers/licencesDB/getOrganizationBankRecords.js";
import { getOrganizationBankRecordStats } from "../helpers/licencesDB/getOrganizationBankRecordStats.js";

import { getMaxOrganizationReminderIndexWithDB } from "../helpers/licencesDB/getMaxOrganizationReminderIndex.js";
import { getMaxOrganizationRemarkIndexWithDB } from "../helpers/licencesDB/getMaxOrganizationRemarkIndex.js";
import { getMaxOrganizationBankRecordIndexWithDB } from "../helpers/licencesDB/getMaxOrganizationBankRecordIndex.js";


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
