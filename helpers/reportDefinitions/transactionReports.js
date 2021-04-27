export const reports = {
    "transactions-all": {
        sql: "select * from LotteryLicenceTransactions"
    },
    "transactions-byTransactionDate": {
        sql: "select licenceID, transactionIndex," +
            " transactionDate, transactionTime," +
            " externalReceiptNumber, transactionAmount, transactionNote" +
            " from LotteryLicenceTransactions" +
            " where transactionDate = ?" +
            " and recordDelete_timeMillis is null",
        params: (req) => [req.query.transactionDate.replace(/-/g, "")]
    },
    "transactions-byLicence": {
        sql: "select licenceID, transactionIndex," +
            " transactionDate, transactionTime," +
            " externalReceiptNumber, transactionAmount, transactionNote" +
            " from LotteryLicenceTransactions" +
            " where licenceID = ?" +
            " and recordDelete_timeMillis is null",
        params: (req) => [req.query.licenceID]
    }
};
export default reports;
