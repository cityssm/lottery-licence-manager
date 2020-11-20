"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganizationRepresentative = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const updateOrganizationRepresentative = (organizationID, reqBody) => {
    const db = sqlite(databasePaths_1.licencesDB);
    db.prepare("update OrganizationRepresentatives" +
        " set representativeName = ?," +
        " representativeTitle = ?," +
        " representativeAddress1 = ?," +
        " representativeAddress2 = ?," +
        " representativeCity = ?," +
        " representativeProvince = ?," +
        " representativePostalCode = ?," +
        " representativePhoneNumber = ?," +
        " representativePhoneNumber2 = ?," +
        " representativeEmailAddress = ?" +
        " where organizationID = ?" +
        " and representativeIndex = ?")
        .run(reqBody.representativeName, reqBody.representativeTitle, reqBody.representativeAddress1, reqBody.representativeAddress2, reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode, reqBody.representativePhoneNumber, reqBody.representativePhoneNumber2, reqBody.representativeEmailAddress, organizationID, reqBody.representativeIndex);
    db.close();
    const representativeObj = {
        organizationID,
        representativeIndex: reqBody.representativeIndex,
        representativeName: reqBody.representativeName,
        representativeTitle: reqBody.representativeTitle,
        representativeAddress1: reqBody.representativeAddress1,
        representativeAddress2: reqBody.representativeAddress2,
        representativeCity: reqBody.representativeCity,
        representativeProvince: reqBody.representativeProvince,
        representativePostalCode: reqBody.representativePostalCode,
        representativePhoneNumber: reqBody.representativePhoneNumber,
        representativePhoneNumber2: reqBody.representativePhoneNumber2,
        representativeEmailAddress: reqBody.representativeEmailAddress,
        isDefault: Number(reqBody.isDefault) > 0
    };
    return representativeObj;
};
exports.updateOrganizationRepresentative = updateOrganizationRepresentative;
