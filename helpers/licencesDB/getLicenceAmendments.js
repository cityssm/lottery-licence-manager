import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const getLicenceAmendmentsWithDB = (db, licenceID) => {
    const amendments = db.prepare("select *" +
        " from LotteryLicenceAmendments" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null" +
        " order by amendmentDate, amendmentTime, amendmentIndex")
        .all(licenceID);
    for (const amendmentObj of amendments) {
        amendmentObj.amendmentDateString = dateTimeFns.dateIntegerToString(amendmentObj.amendmentDate);
        amendmentObj.amendmentTimeString = dateTimeFns.timeIntegerToString(amendmentObj.amendmentTime);
    }
    return amendments;
};
