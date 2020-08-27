"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unissueLicence = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const addLicenceAmendment_1 = require("./addLicenceAmendment");
exports.unissueLicence = (licenceID, reqSession) => {
    const db = sqlite(databasePaths_1.licencesDB);
    const nowMillis = Date.now();
    const info = db.prepare("update LotteryLicences" +
        " set issueDate = null," +
        " issueTime = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and recordDelete_timeMillis is null" +
        " and issueDate is not null")
        .run(reqSession.user.userName, nowMillis, licenceID);
    const changeCount = info.changes;
    if (changeCount) {
        addLicenceAmendment_1.addLicenceAmendmentWithDB(db, licenceID, "Unissue Licence", "", 1, reqSession);
    }
    db.close();
    return changeCount > 0;
};
