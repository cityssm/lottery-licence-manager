import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const addOrganizationBankRecord: (requestBody: llm.OrganizationBankRecord, requestSession: expressSession.Session) => boolean;
