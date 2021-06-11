export const reports = {
    "amendments-all": {
        sql: "select * from LotteryLicenceAmendments"
    },
    "amendments-formatted": {
        sql: "select a.licenceID, l.externalLicenceNumber," +
            " o.organizationName," +
            " amendmentDate, amendmentTime," +
            " amendmentType, amendment," +
            " isHidden" +
            " from LotteryLicenceAmendments a" +
            " left join LotteryLicences l on a.licenceID = l.licenceID" +
            " left join Organizations o on l.organizationID = o.organizationID" +
            " where a.recordDelete_timeMillis is null" +
            " and l.recordDelete_timeMillis is null"
    },
    "amendments-byLicence": {
        sql: "select licenceID, l.externalLicenceNumber," +
            " o.organizationName," +
            " amendmentDate, amendmentTime," +
            " amendmentType, amendment," +
            " isHidden," +
            " from LotteryLicenceAmendments a" +
            " left join LotteryLicences l on a.licenceID = l.licenceID" +
            " left join Organizations o on l.organizationID = o.organizationID" +
            " where a.recordDelete_timeMillis is null" +
            " and a.licenceID = ?",
        params: (req) => [req.query.licenceID]
    }
};
export default reports;
