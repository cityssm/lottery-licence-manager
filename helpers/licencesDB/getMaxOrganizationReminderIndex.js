export const getMaxOrganizationReminderIndexWithDB = (database, organizationID) => {
    const result = database.prepare("select reminderIndex" +
        " from OrganizationReminders" +
        " where organizationID = ?" +
        " order by reminderIndex desc" +
        " limit 1")
        .get(organizationID);
    return (result
        ? result.reminderIndex
        : -1);
};
