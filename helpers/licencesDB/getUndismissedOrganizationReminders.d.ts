import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getUndismissedOrganizationReminders: (requestSession: expressSession.Session) => llm.OrganizationReminder[];
