import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
interface GetLocationsReturn {
    count: number;
    locations: llm.Location[];
}
export declare const getLocations: (requestSession: expressSession.Session, queryOptions: {
    limit: number;
    offset: number;
    locationNameAddress?: string;
    locationIsDistributor: number;
    locationIsManufacturer: number;
    locationIsActive?: "on";
}) => GetLocationsReturn;
export {};
