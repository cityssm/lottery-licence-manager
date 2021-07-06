import type * as sqlite from "better-sqlite3";


export const getMaxLicenceAmendmentIndexWithDB = (database: sqlite.Database, licenceID: number | string): number => {

  const result: {
    amendmentIndex: number;
  } = database.prepare("select amendmentIndex" +
    " from LotteryLicenceAmendments" +
    " where licenceID = ?" +
    " order by amendmentIndex desc" +
    " limit 1")
    .get(licenceID);

  return (result
    ? result.amendmentIndex
    : -1);
};
