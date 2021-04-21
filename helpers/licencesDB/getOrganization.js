import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../licencesDB.js";
export const getOrganization = (organizationID, reqSession) => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const organizationObj = db.prepare("select * from Organizations" +
        " where organizationID = ?")
        .get(organizationID);
    if (organizationObj) {
        organizationObj.recordType = "organization";
        organizationObj.fiscalStartDateString = dateTimeFns.dateIntegerToString(organizationObj.fiscalStartDate);
        organizationObj.fiscalEndDateString = dateTimeFns.dateIntegerToString(organizationObj.fiscalEndDate);
        organizationObj.canUpdate = canUpdateObject(organizationObj, reqSession);
        const representativesList = db.prepare("select * from OrganizationRepresentatives" +
            " where organizationID = ?" +
            " order by isDefault desc, representativeName")
            .all(organizationID);
        organizationObj.organizationRepresentatives = representativesList;
    }
    db.close();
    return organizationObj;
};
export default getOrganization;
