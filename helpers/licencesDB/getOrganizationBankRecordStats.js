import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
export const getOrganizationBankRecordStats = (organizationID) => {
    const db = sqlite(dbPath, {
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
