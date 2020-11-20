"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganization = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB_1 = require("../licencesDB");
const getOrganization = (organizationID, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const organizationObj = db.prepare("select * from Organizations" +
        " where organizationID = ?")
        .get(organizationID);
    if (organizationObj) {
        organizationObj.recordType = "organization";
        organizationObj.fiscalStartDateString = dateTimeFns.dateIntegerToString(organizationObj.fiscalStartDate);
        organizationObj.fiscalEndDateString = dateTimeFns.dateIntegerToString(organizationObj.fiscalEndDate);
        organizationObj.canUpdate = licencesDB_1.canUpdateObject(organizationObj, reqSession);
        const representativesList = db.prepare("select * from OrganizationRepresentatives" +
            " where organizationID = ?" +
            " order by isDefault desc, representativeName")
            .all(organizationID);
        organizationObj.organizationRepresentatives = representativesList;
    }
    db.close();
    return organizationObj;
};
exports.getOrganization = getOrganization;
