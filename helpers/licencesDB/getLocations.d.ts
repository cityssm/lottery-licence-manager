import type * as expressSession from 'express-session';
import type * as llm from '../../types/recordTypes';
export interface GetLocationsReturn {
    count: number;
    locations: llm.Location[];
}
export default function getLocations(requestSession: expressSession.Session, queryOptions: {
    limit: number;
    offset: number;
    locationNameAddress?: string;
    locationIsDistributor: -1 | 0 | 1;
    locationIsManufacturer: -1 | 0 | 1;
    locationIsActive?: 'on';
}): GetLocationsReturn;
