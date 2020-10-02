/// <reference types="csurf" />
/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-rate-limit" />
/// <reference types="express-session" />
import type * as llm from "../../types/recordTypes";
export declare const getOrganizations: (reqBody: {
    organizationName?: string;
    representativeName?: string;
    isEligibleForLicences?: string;
    organizationIsActive?: string;
}, reqSession: Express.SessionData, includeOptions: {
    limit: number;
    offset?: number;
}) => llm.Organization[];
