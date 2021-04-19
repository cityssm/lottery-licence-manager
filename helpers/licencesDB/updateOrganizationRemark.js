import { runSQL_hasChanges } from "./_runSQL.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const updateOrganizationRemark = (reqBody, reqSession) => {
    return runSQL_hasChanges("update OrganizationRemarks" +
        " set remarkDate = ?," +
        " remarkTime = ?," +
        " remark = ?," +
        " isImportant = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null", [
        dateTimeFns.dateStringToInteger(reqBody.remarkDateString),
        dateTimeFns.timeStringToInteger(reqBody.remarkTimeString),
        reqBody.remark,
        reqBody.isImportant ? 1 : 0,
        reqSession.user.userName,
        Date.now(),
        reqBody.organizationID,
        reqBody.remarkIndex
    ]);
};
