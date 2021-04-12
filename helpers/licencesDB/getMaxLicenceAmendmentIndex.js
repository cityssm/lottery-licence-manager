"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxLicenceAmendmentIndexWithDB = void 0;
const getMaxLicenceAmendmentIndexWithDB = (db, licenceID) => {
    const result = db.prepare("select amendmentIndex" +
        " from LotteryLicenceAmendments" +
        " where licenceID = ?" +
        " order by amendmentIndex desc" +
        " limit 1")
        .get(licenceID);
    return (result
        ? result.amendmentIndex
        : -1);
};
exports.getMaxLicenceAmendmentIndexWithDB = getMaxLicenceAmendmentIndexWithDB;
