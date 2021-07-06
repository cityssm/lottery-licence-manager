import sqlite from "better-sqlite3";
import type * as expressSession from "express-session";
export declare const deleteOrganizationReminderWithDB: (database: sqlite.Database, organizationID: number, reminderIndex: number, requestSession: expressSession.Session) => boolean;
export declare const deleteOrganizationReminder: (organizationID: number, reminderIndex: number, requestSession: expressSession.Session) => boolean;
