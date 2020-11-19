import * as sqlite from "better-sqlite3";
export declare const deleteOrganizationReminderWithDB: (db: sqlite.Database, organizationID: number, reminderIndex: number, reqSession: any) => boolean;
export declare const deleteOrganizationReminder: (organizationID: number, reminderIndex: number, reqSession: any) => boolean;
