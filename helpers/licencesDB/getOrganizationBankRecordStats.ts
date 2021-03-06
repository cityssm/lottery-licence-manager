import sqlite from "better-sqlite3";

import { licencesDB as databasePath } from "../../data/databasePaths.js";


interface GetOrganizationBankRecordStatsReturn {
  accountNumber: string;
  bankingYearMin: number;
  bankingYearMax: number;
}

export const getOrganizationBankRecordStats = (organizationID: number | string) : GetOrganizationBankRecordStatsReturn[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const rows: GetOrganizationBankRecordStatsReturn[] = database.prepare("select accountNumber," +
    " min(bankingYear) as bankingYearMin," +
    " max(bankingYear) as bankingYearMax" +
    " from OrganizationBankRecords" +
    " where recordDelete_timeMillis is null" +
    " and organizationID = ?" +
    " group by accountNumber" +
    " order by bankingYearMax desc, accountNumber")

    .all(organizationID);

  database.close();

  return rows;
};
