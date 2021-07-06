import sqlite from "better-sqlite3";
import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
interface ReminderData {
    organizationID: string;
    reminderTypeKey: string;
    dueDateString?: string;
    reminderStatus: string;
    reminderNote: string;
}
export declare const addOrganizationReminderWithDB: (database: sqlite.Database, reminderData: ReminderData, requestSession: expressSession.Session) => llm.OrganizationReminder;
export declare const addOrganizationReminder: (requestBody: ReminderData, requestSession: expressSession.Session) => llm.OrganizationReminder;
export {};
