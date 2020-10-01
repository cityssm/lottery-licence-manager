/// <reference types="csurf" />
/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-rate-limit" />
/// <reference types="express-session" />
import sqlite from "better-sqlite3";
import type * as llm from "../../types/recordTypes";
interface ReminderData {
    organizationID: string;
    reminderTypeKey: string;
    reminderDateString?: string;
    reminderStatus: string;
    reminderNote: string;
}
export declare const addOrganizationReminderWithDB: (db: sqlite.Database, reminderData: ReminderData, reqSession: Express.SessionData) => llm.OrganizationReminder;
export declare const addOrganizationReminder: (reqBody: ReminderData, reqSession: Express.SessionData) => llm.OrganizationReminder;
export {};
