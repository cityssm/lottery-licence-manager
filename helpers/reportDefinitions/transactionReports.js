export const reports = {
    "transactions-all": {
        sql: "select * from LotteryLicenceTransactions"
    },
    "transactions-byTransactionDate": {
        sql: "select t.licenceID, l.externalLicenceNumber," +
            " o.organizationName," +
            " transactionDate, transactionTime," +
            " externalReceiptNumber, transactionAmount, transactionNote" +
            " from LotteryLicenceTransactions t" +
            " left join LotteryLicences l on t.licenceID = l.licenceID" +
            " left join Organizations o on l.organizationID = o.organizationID" +
            " where transactionDate = ?" +
            " and t.recordDelete_timeMillis is null",
        params: (req) => [req.query.transactionDate.replace(/-/g, "")]
    },
    "transactions-byLicence": {
        sql: "select licenceID, transactionIndex," +
            " transactionDate, transactionTime," +
            " externalReceiptNumber, transactionAmount, transactionNote" +
            " from LotteryLicenceTransactions t" +
            " where licenceID = ?" +
            " and recordDelete_timeMillis is null",
        params: (req) => [req.query.licenceID]
    }
};
export default reports;
