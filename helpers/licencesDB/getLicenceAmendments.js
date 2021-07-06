import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const getLicenceAmendmentsWithDB = (database, licenceID) => {
    const amendments = database.prepare("select *" +
        " from LotteryLicenceAmendments" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null" +
        " order by amendmentDate, amendmentTime, amendmentIndex")
        .all(licenceID);
    for (const amendmentObject of amendments) {
        amendmentObject.amendmentDateString = dateTimeFns.dateIntegerToString(amendmentObject.amendmentDate);
        amendmentObject.amendmentTimeString = dateTimeFns.timeIntegerToString(amendmentObject.amendmentTime);
    }
    return amendments;
};
