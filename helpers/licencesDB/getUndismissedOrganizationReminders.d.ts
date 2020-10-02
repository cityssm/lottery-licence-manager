/// <reference types="csurf" />
/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-rate-limit" />
/// <reference types="express-session" />
import type * as llm from "../../types/recordTypes";
export declare const getUndismissedOrganizationReminders: (reqSession: Express.SessionData) => llm.OrganizationReminder[];
