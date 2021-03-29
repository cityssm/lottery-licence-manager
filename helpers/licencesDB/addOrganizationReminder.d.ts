import * as sqlite from "better-sqlite3";
import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
interface ReminderData {
    organizationID: string;
    reminderTypeKey: string;
    dueDateString?: string;
    reminderStatus: string;
    reminderNote: string;
}
export declare const addOrganizationReminderWithDB: (db: sqlite.Database, reminderData: ReminderData, reqSession: expressSession.Session) => llm.OrganizationReminder;
export declare const addOrganizationReminder: (reqBody: ReminderData, reqSession: expressSession.Session) => llm.OrganizationReminder;
export {};
