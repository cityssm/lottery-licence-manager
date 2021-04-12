import type * as sqlite from "better-sqlite3";


export const getMaxTransactionIndexWithDB = (db: sqlite.Database, licenceID: number | string) => {

  const result: {
    transactionIndex: number;
  } = db.prepare("select transactionIndex" +
    " from LotteryLicenceTransactions" +
    " where licenceID = ?" +
    " order by transactionIndex desc" +
    " limit 1")
    .get(licenceID);

  return (result
    ? result.transactionIndex
    : -1);
};
