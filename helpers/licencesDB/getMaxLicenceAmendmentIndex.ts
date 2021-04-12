import type * as sqlite from "better-sqlite3";


export const getMaxLicenceAmendmentIndexWithDB = (db: sqlite.Database, licenceID: number | string) => {

  const result: {
    amendmentIndex: number;
  } = db.prepare("select amendmentIndex" +
    " from LotteryLicenceAmendments" +
    " where licenceID = ?" +
    " order by amendmentIndex desc" +
    " limit 1")
    .get(licenceID);

  return (result
    ? result.amendmentIndex
    : -1);
};
