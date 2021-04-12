"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxOrganizationBankRecordIndexWithDB = void 0;
const getMaxOrganizationBankRecordIndexWithDB = (db, organizationID) => {
    const result = db.prepare("select recordIndex" +
        " from OrganizationBankRecords" +
        " where organizationID = ?" +
        " order by recordIndex desc" +
        " limit 1")
        .get(organizationID);
    return (result
        ? result.recordIndex
        : -1);
};
exports.getMaxOrganizationBankRecordIndexWithDB = getMaxOrganizationBankRecordIndexWithDB;
