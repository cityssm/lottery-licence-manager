import { getMaxLicenceAmendmentIndexWithDB } from "./getMaxLicenceAmendmentIndex.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const addLicenceAmendmentWithDB = (database, licenceID, amendmentType, amendment, isHidden, requestSession) => {
    const newAmendmentIndex = getMaxLicenceAmendmentIndexWithDB(database, licenceID) + 1;
    const nowDate = new Date();
    const amendmentDate = dateTimeFns.dateToInteger(nowDate);
    const amendmentTime = dateTimeFns.dateToTimeInteger(nowDate);
    database.prepare("insert into LotteryLicenceAmendments" +
        " (licenceID, amendmentIndex, amendmentDate, amendmentTime, amendmentType, amendment, isHidden," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(licenceID, newAmendmentIndex, amendmentDate, amendmentTime, amendmentType, amendment, isHidden, requestSession.user.userName, nowDate.getTime(), requestSession.user.userName, nowDate.getTime());
    return newAmendmentIndex;
};
