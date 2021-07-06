import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getOrganizationRemark: (organizationID: number, remarkIndex: number, requestSession: expressSession.Session) => llm.OrganizationRemark;
