"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationBankRecordStats = exports.setDefaultOrganizationRepresentative = exports.deleteOrganizationRepresentative = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../data/databasePaths");
const deleteOrganizationRepresentative = (organizationID, representativeIndex) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const info = db.prepare("delete from OrganizationRepresentatives" +
        " where organizationID = ?" +
        " and representativeIndex = ?")
        .run(organizationID, representativeIndex);
    db.close();
    return info.changes > 0;
};
exports.deleteOrganizationRepresentative = deleteOrganizationRepresentative;
const setDefaultOrganizationRepresentative = (organizationID, representativeIndex) => {
    const db = sqlite(databasePaths_1.licencesDB);
    db.prepare("update OrganizationRepresentatives" +
        " set isDefault = 0" +
        " where organizationID = ?")
        .run(organizationID);
    db.prepare("update OrganizationRepresentatives" +
        " set isDefault = 1" +
        " where organizationID = ?" +
        " and representativeIndex = ?")
        .run(organizationID, representativeIndex);
    db.close();
    return true;
};
exports.setDefaultOrganizationRepresentative = setDefaultOrganizationRepresentative;
const getOrganizationBankRecordStats = (organizationID) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const rows = db.prepare("select accountNumber," +
        " min(bankingYear) as bankingYearMin," +
        " max(bankingYear) as bankingYearMax" +
        " from OrganizationBankRecords" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?" +
        " group by accountNumber" +
        " order by bankingYearMax desc, accountNumber")
        .all(organizationID);
    db.close();
    return rows;
};
exports.getOrganizationBankRecordStats = getOrganizationBankRecordStats;
