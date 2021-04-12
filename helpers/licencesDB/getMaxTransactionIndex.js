"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxTransactionIndexWithDB = void 0;
const getMaxTransactionIndexWithDB = (db, licenceID) => {
    const result = db.prepare("select transactionIndex" +
        " from LotteryLicenceTransactions" +
        " where licenceID = ?" +
        " order by transactionIndex desc" +
        " limit 1")
        .get(licenceID);
    return (result
        ? result.transactionIndex
        : -1);
};
exports.getMaxTransactionIndexWithDB = getMaxTransactionIndexWithDB;
