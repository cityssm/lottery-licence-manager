export const getMaxTransactionIndexWithDB = (database, licenceID) => {
    const result = database.prepare("select transactionIndex" +
        " from LotteryLicenceTransactions" +
        " where licenceID = ?" +
        " order by transactionIndex desc" +
        " limit 1")
        .get(licenceID);
    return (result
        ? result.transactionIndex
        : -1);
};
