"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextExternalLicenceNumberFromRange = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const getApplicationSetting_1 = require("./getApplicationSetting");
exports.getNextExternalLicenceNumberFromRange = () => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const rangeStartFromConfig = getApplicationSetting_1.getApplicationSettingWithDB(db, "licences.externalLicenceNumber.range.start");
    const rangeStart = (rangeStartFromConfig === "" ? -1 : parseInt(rangeStartFromConfig, 10));
    const rangeEnd = parseInt(getApplicationSetting_1.getApplicationSettingWithDB(db, "licences.externalLicenceNumber.range.end") || "0", 10);
    const row = db.prepare("select max(externalLicenceNumberInteger) as maxExternalLicenceNumberInteger" +
        " from LotteryLicences" +
        " where externalLicenceNumberInteger >= ?" +
        " and externalLicenceNumberInteger <= ?")
        .get(rangeStart, rangeEnd);
    db.close();
    if (!row) {
        return rangeStart;
    }
    const maxExternalLicenceNumber = row.maxExternalLicenceNumberInteger;
    if (!maxExternalLicenceNumber) {
        return rangeStart;
    }
    const newExternalLicenceNumber = maxExternalLicenceNumber + 1;
    if (newExternalLicenceNumber > rangeEnd) {
        return -1;
    }
    return newExternalLicenceNumber;
};
