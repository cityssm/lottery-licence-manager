import type * as expressSession from 'express-session';
import type * as llm from '../../types/recordTypes';
export interface GetEventsFilters {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationName?: string;
    locationName?: string;
    eventYear?: string;
}
interface GetEventsReturn {
    count: number;
    events: llm.LotteryEvent[];
}
export default function getEvents(requestBody: GetEventsFilters, requestSession: expressSession.Session, options: {
    limit: number;
    offset: number;
}): GetEventsReturn;
export {};
