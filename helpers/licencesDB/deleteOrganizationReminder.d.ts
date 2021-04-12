import type * as expressSession from "express-session";
import * as sqlite from "better-sqlite3";
export declare const deleteOrganizationReminderWithDB: (db: sqlite.Database, organizationID: number, reminderIndex: number, reqSession: expressSession.Session) => sqlite.RunResult;
export declare const deleteOrganizationReminder: (organizationID: number, reminderIndex: number, reqSession: expressSession.Session) => sqlite.RunResult;
