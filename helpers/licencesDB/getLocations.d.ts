import type { Location, User } from '../../types/recordTypes.js';
export interface GetLocationsReturn {
    count: number;
    locations: Location[];
}
export default function getLocations(requestUser: User, queryOptions: {
    limit: number;
    offset: number;
    locationNameAddress?: string;
    locationIsDistributor: -1 | 0 | 1;
    locationIsManufacturer: -1 | 0 | 1;
    locationIsActive?: 'on';
}): GetLocationsReturn;
