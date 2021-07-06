import type * as sqlite from "better-sqlite3";


export const getMaxOrganizationBankRecordIndexWithDB = (database: sqlite.Database, organizationID: number | string): number => {

  const result: {
    recordIndex: number;
  } = database.prepare("select recordIndex" +
    " from OrganizationBankRecords" +
    " where organizationID = ?" +
    " order by recordIndex desc" +
    " limit 1")
    .get(organizationID);

  return (result
    ? result.recordIndex
    : -1);
};
