/// <reference types="csurf" />
/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-rate-limit" />
/// <reference types="express-session" />
import * as sqlite from "better-sqlite3";
export declare const deleteOrganizationReminderWithDB: (db: sqlite.Database, organizationID: number, reminderIndex: number, reqSession: Express.SessionData) => boolean;
export declare const deleteOrganizationReminder: (organizationID: number, reminderIndex: number, reqSession: Express.SessionData) => boolean;
