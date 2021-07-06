import type * as sqlite from "better-sqlite3";


export const getMaxTransactionIndexWithDB = (database: sqlite.Database, licenceID: number | string): number => {

  const result: {
    transactionIndex: number;
  } = database.prepare("select transactionIndex" +
    " from LotteryLicenceTransactions" +
    " where licenceID = ?" +
    " order by transactionIndex desc" +
    " limit 1")
    .get(licenceID);

  return (result
    ? result.transactionIndex
    : -1);
};
