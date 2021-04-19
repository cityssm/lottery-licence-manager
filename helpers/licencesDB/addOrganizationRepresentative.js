import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
export const addOrganizationRepresentative = (organizationID, reqBody) => {
    const db = sqlite(dbPath);
    const row = db.prepare("select count(representativeIndex) as indexCount," +
        " ifnull(max(representativeIndex), -1) as maxIndex" +
        " from OrganizationRepresentatives" +
        " where organizationID = ?")
        .get(organizationID);
    const newRepresentativeIndex = row.maxIndex + 1;
    const newIsDefault = (row.indexCount === 0 ? 1 : 0);
    db.prepare("insert into OrganizationRepresentatives (" +
        "organizationID, representativeIndex," +
        " representativeName, representativeTitle," +
        " representativeAddress1, representativeAddress2," +
        " representativeCity, representativeProvince, representativePostalCode," +
        " representativePhoneNumber, representativePhoneNumber2, representativeEmailAddress," +
        " isDefault)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(organizationID, newRepresentativeIndex, reqBody.representativeName, reqBody.representativeTitle, reqBody.representativeAddress1, reqBody.representativeAddress2, reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode, reqBody.representativePhoneNumber, reqBody.representativePhoneNumber2, reqBody.representativeEmailAddress, newIsDefault);
    db.close();
    const representativeObj = {
        organizationID,
        representativeIndex: newRepresentativeIndex,
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
        isDefault: newIsDefault === 1
    };
    return representativeObj;
};
