import * as sqlite from "better-sqlite3";
import type * as llm from "../../types/recordTypes";
export declare const getOrganizationRemindersWithDB: (db: sqlite.Database, organizationID: number, reqSession: any) => llm.OrganizationReminder[];
export declare const getOrganizationReminders: (organizationID: number, reqSession: any) => llm.OrganizationReminder[];
