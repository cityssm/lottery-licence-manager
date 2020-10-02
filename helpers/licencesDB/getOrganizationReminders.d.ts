/// <reference types="csurf" />
/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-rate-limit" />
/// <reference types="express-session" />
import * as sqlite from "better-sqlite3";
import type * as llm from "../../types/recordTypes";
export declare const getOrganizationRemindersWithDB: (db: sqlite.Database, organizationID: number, reqSession: Express.SessionData) => llm.OrganizationReminder[];
export declare const getOrganizationReminders: (organizationID: number, reqSession: Express.SessionData) => llm.OrganizationReminder[];
