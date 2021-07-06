import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const createOrganization: (requestBody: llm.Organization, requestSession: expressSession.Session) => number;
