import { canUpdateObject } from "../licencesDB.js";
import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";
export const getLocation = (locationID, reqSession) => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const locationObj = db.prepare("select * from Locations" +
        " where locationID = ?")
        .get(locationID);
    if (locationObj) {
        locationObj.recordType = "location";
        locationObj.locationDisplayName =
            locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName;
        locationObj.canUpdate = canUpdateObject(locationObj, reqSession);
    }
    db.close();
    return locationObj;
};
