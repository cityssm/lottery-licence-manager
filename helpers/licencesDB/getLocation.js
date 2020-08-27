"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocation = void 0;
const licencesDB_1 = require("../licencesDB");
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.getLocation = (locationID, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const locationObj = db.prepare("select * from Locations" +
        " where locationID = ?")
        .get(locationID);
    if (locationObj) {
        locationObj.recordType = "location";
        locationObj.locationDisplayName =
            locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName;
        locationObj.canUpdate = licencesDB_1.canUpdateObject(locationObj, reqSession);
    }
    db.close();
    return locationObj;
};
