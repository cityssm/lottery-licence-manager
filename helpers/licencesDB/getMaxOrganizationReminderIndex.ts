import type * as sqlite from "better-sqlite3";


export const getMaxOrganizationReminderIndexWithDB = (database: sqlite.Database, organizationID: number | string): number => {

  const result: {
    reminderIndex: number;
  } = database.prepare("select reminderIndex" +
    " from OrganizationReminders" +
    " where organizationID = ?" +
    " order by reminderIndex desc" +
    " limit 1")
    .get(organizationID);

  return (result
    ? result.reminderIndex
    : -1);
};
