import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getOrganizationReminder: (organizationID: number, reminderIndex: number, reqSession: expressSession.Session) => llm.OrganizationReminder;
