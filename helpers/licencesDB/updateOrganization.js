"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganization = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const updateOrganization = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update Organizations" +
        " set organizationName = ?," +
        " organizationAddress1 = ?," +
        " organizationAddress2 = ?," +
        " organizationCity = ?," +
        " organizationProvince = ?," +
        " organizationPostalCode = ?," +
        " trustAccountNumber = ?," +
        " fiscalStartDate = ?," +
        " fiscalEndDate = ?," +
        " isEligibleForLicences = ?," +
        " organizationNote = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqBody.organizationName, reqBody.organizationAddress1, reqBody.organizationAddress2, reqBody.organizationCity, reqBody.organizationProvince, reqBody.organizationPostalCode, reqBody.trustAccountNumber, dateTimeFns.dateStringToInteger(reqBody.fiscalStartDateString), dateTimeFns.dateStringToInteger(reqBody.fiscalEndDateString), reqBody.isEligibleForLicences, reqBody.organizationNote, reqSession.user.userName, nowMillis, reqBody.organizationID);
    db.close();
    return info.changes > 0;
};
exports.updateOrganization = updateOrganization;
