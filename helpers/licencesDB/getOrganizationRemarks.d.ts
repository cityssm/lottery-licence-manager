/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
import type * as llm from "../../types/recordTypes";
export declare const getOrganizationRemarks: (organizationID: number, reqSession: Express.SessionData) => llm.OrganizationRemark[];
