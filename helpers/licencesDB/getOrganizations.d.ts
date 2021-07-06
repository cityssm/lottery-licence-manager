import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getOrganizations: (requestBody: {
    organizationName?: string;
    representativeName?: string;
    isEligibleForLicences?: string;
    organizationIsActive?: string;
}, requestSession: expressSession.Session, includeOptions: {
    limit: number;
    offset?: number;
}) => llm.Organization[];
