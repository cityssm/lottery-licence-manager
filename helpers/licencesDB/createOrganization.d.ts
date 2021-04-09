import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const createOrganization: (reqBody: llm.Organization, reqSession: expressSession.Session) => number;
