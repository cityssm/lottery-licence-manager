import type * as sqlite from "better-sqlite3";


export const getMaxOrganizationRemarkIndexWithDB = (db: sqlite.Database, organizationID: number) => {

  const result: {
    remarkIndex: number;
  } = db.prepare("select remarkIndex" +
    " from OrganizationRemarks" +
    " where organizationID = ?" +
    " order by remarkIndex desc" +
    " limit 1")
    .get(organizationID);

  return (result
    ? result.remarkIndex
    : -1);
};
