import * as sqlite from "better-sqlite3";
import type * as expressSession from "express-session";
export declare const deleteOrganizationReminderWithDB: (db: sqlite.Database, organizationID: number, reminderIndex: number, reqSession: expressSession.Session) => boolean;
export declare const deleteOrganizationReminder: (organizationID: number, reminderIndex: number, reqSession: expressSession.Session) => boolean;
