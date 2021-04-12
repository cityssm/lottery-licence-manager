"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxOrganizationReminderIndexWithDB = void 0;
const getMaxOrganizationReminderIndexWithDB = (db, organizationID) => {
    const result = db.prepare("select reminderIndex" +
        " from OrganizationReminders" +
        " where organizationID = ?" +
        " order by reminderIndex desc" +
        " limit 1")
        .get(organizationID);
    return (result
        ? result.reminderIndex
        : -1);
};
exports.getMaxOrganizationReminderIndexWithDB = getMaxOrganizationReminderIndexWithDB;
