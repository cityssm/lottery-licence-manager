import type * as expressSession from 'express-session';
import type * as llm from '../../types/recordTypes';
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
    licences: llm.LotteryLicence[];
}
export default function getLicences(requestBodyOrParametersObject: GetLicencesFilters, requestSession: expressSession.Session, includeOptions: {
    includeOrganization: boolean;
    limit: number;
    offset?: number;
}): GetLicencesReturn;
export {};
