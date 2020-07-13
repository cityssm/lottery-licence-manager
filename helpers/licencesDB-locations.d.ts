/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
import * as llm from "./llmTypes";
export declare const getLocations: (reqSession: Express.SessionData, queryOptions: {
    limit: number;
    offset?: number;
    locationNameAddress?: string;
    locationIsDistributor: number;
    locationIsManufacturer: number;
    locationIsActive: string;
}) => {
    count: number;
    locations: llm.Location[];
};
export declare const getLocation: (locationID: number, reqSession: Express.SessionData) => llm.Location;
export declare const createLocation: (reqBody: llm.Location, reqSession: Express.SessionData) => number;
export declare const updateLocation: (reqBody: llm.Location, reqSession: Express.SessionData) => boolean;
export declare const deleteLocation: (locationID: number, reqSession: Express.SessionData) => boolean;
export declare const restoreLocation: (locationID: number, reqSession: Express.SessionData) => boolean;
export declare const mergeLocations: (targetLocationID: number, sourceLocationID: number, reqSession: Express.SessionData) => boolean;
export declare const getInactiveLocations: (inactiveYears: number) => llm.Location[];
