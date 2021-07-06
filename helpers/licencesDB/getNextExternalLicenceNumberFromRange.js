import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";
import { getApplicationSettingWithDB } from "./getApplicationSetting.js";
export const getNextExternalLicenceNumberFromRange = () => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const rangeStartFromConfig = getApplicationSettingWithDB(database, "licences.externalLicenceNumber.range.start");
    const rangeStart = (rangeStartFromConfig === "" ? -1 : Number.parseInt(rangeStartFromConfig, 10));
    const rangeEnd = Number.parseInt(getApplicationSettingWithDB(database, "licences.externalLicenceNumber.range.end") || "0", 10);
    const row = database.prepare("select max(externalLicenceNumberInteger) as maxExternalLicenceNumberInteger" +
        " from LotteryLicences" +
        " where externalLicenceNumberInteger >= ?" +
        " and externalLicenceNumberInteger <= ?")
        .get(rangeStart, rangeEnd);
    database.close();
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
