/// <reference types="express-session" />
import * as llm from "./llmTypes";
export declare function getLocations(reqSession: Express.SessionData, queryOptions: {
    limit: number;
    offset?: number;
    locationNameAddress: string;
    locationIsDistributor: number;
    locationIsManufacturer: number;
}): {
    count: number;
    locations: llm.Location[];
};
export declare function getLocation(locationID: number, reqSession: Express.SessionData): llm.Location;
export declare function createLocation(reqBody: llm.Location, reqSession: Express.SessionData): number;
export declare function updateLocation(reqBody: llm.Location, reqSession: Express.SessionData): boolean;
export declare function deleteLocation(locationID: number, reqSession: Express.SessionData): boolean;
export declare function restoreLocation(locationID: number, reqSession: Express.SessionData): boolean;
export declare function mergeLocations(targetLocationID: number, sourceLocationID: number, reqSession: Express.SessionData): boolean;
export declare function getInactiveLocations(inactiveYears: number): llm.Location[];
