import type * as llm from "../../types/recordTypes";
export declare const getOrganizations: (reqBody: {
    organizationName?: string;
    representativeName?: string;
    isEligibleForLicences?: string;
    organizationIsActive?: string;
}, reqSession: any, includeOptions: {
    limit: number;
    offset?: number;
}) => llm.Organization[];
