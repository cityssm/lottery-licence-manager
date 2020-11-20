import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getUndismissedOrganizationReminders: (reqSession: expressSession.Session) => llm.OrganizationReminder[];
