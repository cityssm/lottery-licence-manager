import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getOrganization: (organizationID: number, requestSession: expressSession.Session) => llm.Organization;
export default getOrganization;
