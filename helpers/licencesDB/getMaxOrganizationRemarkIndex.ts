import type * as sqlite from "better-sqlite3";


export const getMaxOrganizationRemarkIndexWithDB = (database: sqlite.Database, organizationID: number): number => {

  const result: {
    remarkIndex: number;
  } = database.prepare("select remarkIndex" +
    " from OrganizationRemarks" +
    " where organizationID = ?" +
    " order by remarkIndex desc" +
    " limit 1")
    .get(organizationID);

  return (result
    ? result.remarkIndex
    : -1);
};
