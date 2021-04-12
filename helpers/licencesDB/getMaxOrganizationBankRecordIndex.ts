import type * as sqlite from "better-sqlite3";


export const getMaxOrganizationBankRecordIndexWithDB = (db: sqlite.Database, organizationID: number | string) => {

  const result: {
    recordIndex: number;
  } = db.prepare("select recordIndex" +
    " from OrganizationBankRecords" +
    " where organizationID = ?" +
    " order by recordIndex desc" +
    " limit 1")
    .get(organizationID);

  return (result
    ? result.recordIndex
    : -1);
};
