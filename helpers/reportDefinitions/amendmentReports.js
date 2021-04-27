export const reports = {
    "amendments-all": {
        sql: "select * from LotteryLicenceAmendments"
    },
    "amendments-byLicence": {
        sql: "select licenceID, amendmentIndex, amendmentDate, amendmentTime," +
            " amendmentType, amendment," +
            " isHidden," +
            " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
            " from LotteryLicenceAmendments" +
            " where recordDelete_timeMillis is null" +
            " and licenceID = ?",
        params: (req) => [req.query.licenceID]
    }
};
export default reports;
