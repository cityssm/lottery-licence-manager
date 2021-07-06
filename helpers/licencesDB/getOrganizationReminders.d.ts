import sqlite from "better-sqlite3";
import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getOrganizationRemindersWithDB: (database: sqlite.Database, organizationID: number, requestSession: expressSession.Session) => llm.OrganizationReminder[];
export declare const getOrganizationReminders: (organizationID: number, requestSession: expressSession.Session) => llm.OrganizationReminder[];
