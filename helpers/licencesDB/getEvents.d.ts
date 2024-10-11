import type { LotteryEvent, User } from '../../types/recordTypes';
export interface GetEventsFilters {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationName?: string;
    locationName?: string;
    eventYear?: string;
}
export interface GetEventsReturn {
    count: number;
    events: LotteryEvent[];
}
export default function getEvents(requestBody: GetEventsFilters, requestUser: User, options: {
    limit: number;
    offset: number;
}): GetEventsReturn;
