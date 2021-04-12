"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganization = void 0;
const _runSQL_1 = require("./_runSQL");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const updateOrganization = (reqBody, reqSession) => {
    return _runSQL_1.runSQL_hasChanges("update Organizations" +
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
        " and recordDelete_timeMillis is null", [
        reqBody.organizationName,
        reqBody.organizationAddress1,
        reqBody.organizationAddress2,
        reqBody.organizationCity,
        reqBody.organizationProvince,
        reqBody.organizationPostalCode,
        reqBody.trustAccountNumber,
        dateTimeFns.dateStringToInteger(reqBody.fiscalStartDateString),
        dateTimeFns.dateStringToInteger(reqBody.fiscalEndDateString),
        reqBody.isEligibleForLicences,
        reqBody.organizationNote,
        reqSession.user.userName,
        Date.now(),
        reqBody.organizationID
    ]);
};
exports.updateOrganization = updateOrganization;
