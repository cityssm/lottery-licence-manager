import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
import { getApplicationSettingWithDB } from "./getApplicationSetting.js";
export const getNextExternalLicenceNumberFromRange = () => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const rangeStartFromConfig = getApplicationSettingWithDB(db, "licences.externalLicenceNumber.range.start");
    const rangeStart = (rangeStartFromConfig === "" ? -1 : parseInt(rangeStartFromConfig, 10));
    const rangeEnd = parseInt(getApplicationSettingWithDB(db, "licences.externalLicenceNumber.range.end") || "0", 10);
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
