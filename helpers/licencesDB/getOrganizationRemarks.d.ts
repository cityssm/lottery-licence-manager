import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getOrganizationRemarks: (organizationID: number, reqSession: expressSession.Session) => llm.OrganizationRemark[];
