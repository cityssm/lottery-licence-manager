import sqlite from "better-sqlite3";
import { getMaxOrganizationRemarkIndexWithDB } from "./getMaxOrganizationRemarkIndex.js";
import { licencesDB as databasePath } from "../../data/databasePaths.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const addOrganizationRemark = (requestBody, requestSession) => {
    const database = sqlite(databasePath);
    const newRemarkIndex = getMaxOrganizationRemarkIndexWithDB(database, requestBody.organizationID) + 1;
    const rightNow = new Date();
    const remarkDate = dateTimeFns.dateToInteger(rightNow);
    const remarkTime = dateTimeFns.dateToTimeInteger(rightNow);
    database.prepare("insert into OrganizationRemarks (" +
        "organizationID, remarkIndex," +
        " remarkDate, remarkTime, remark, isImportant," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(requestBody.organizationID, newRemarkIndex, remarkDate, remarkTime, requestBody.remark, requestBody.isImportant ? 1 : 0, requestSession.user.userName, rightNow.getTime(), requestSession.user.userName, rightNow.getTime());
    database.close();
    return newRemarkIndex;
};
