import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getOrganization: (organizationID: number, reqSession: expressSession.Session) => llm.Organization;
export default getOrganization;
