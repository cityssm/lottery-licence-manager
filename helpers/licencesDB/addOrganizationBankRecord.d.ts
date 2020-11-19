import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const addOrganizationBankRecord: (reqBody: llm.OrganizationBankRecord, reqSession: expressSession.Session) => boolean;
