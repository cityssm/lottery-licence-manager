import type * as sqlite from "better-sqlite3";


export const getMaxOrganizationReminderIndexWithDB = (db: sqlite.Database, organizationID: number | string) => {

  const result: {
    reminderIndex: number;
  } = db.prepare("select reminderIndex" +
    " from OrganizationReminders" +
    " where organizationID = ?" +
    " order by reminderIndex desc" +
    " limit 1")
    .get(organizationID);

  return (result
    ? result.reminderIndex
    : -1);
};
