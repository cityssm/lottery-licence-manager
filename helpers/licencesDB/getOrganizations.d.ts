import type { Organization, User } from '../../types/recordTypes.js';
export interface GetOrganizationsFilters {
    organizationName?: string;
    representativeName?: string;
    isEligibleForLicences?: string;
    organizationIsActive?: string;
}
export default function getOrganizations(requestBody: GetOrganizationsFilters, requestUser: User, includeOptions: {
    limit: number;
    offset?: number;
}): Organization[];
