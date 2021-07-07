import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const updateOrganization: (requestBody: llm.Organization, requestSession: expressSession.Session) => boolean;
