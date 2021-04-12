"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxOrganizationRemarkIndexWithDB = void 0;
const getMaxOrganizationRemarkIndexWithDB = (db, organizationID) => {
    const result = db.prepare("select remarkIndex" +
        " from OrganizationRemarks" +
        " where organizationID = ?" +
        " order by remarkIndex desc" +
        " limit 1")
        .get(organizationID);
    return (result
        ? result.remarkIndex
        : -1);
};
exports.getMaxOrganizationRemarkIndexWithDB = getMaxOrganizationRemarkIndexWithDB;
