import type { LotteryLicence, User } from '../../types/recordTypes';
export interface GetLicencesFilters {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationID?: string | number;
    organizationName?: string;
    licenceStatus?: 'past' | 'active';
    locationID?: number;
    locationName?: string;
}
interface GetLicencesReturn {
    count: number;
    licences: LotteryLicence[];
}
export default function getLicences(requestBodyOrParametersObject: GetLicencesFilters, requestUser: User, includeOptions: {
    includeOrganization: boolean;
    limit: number;
    offset?: number;
}): GetLicencesReturn;
export {};
