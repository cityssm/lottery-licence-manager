/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
import * as llm from "../types/recordTypes";
export declare const createLocation: (reqBody: llm.Location, reqSession: Express.SessionData) => number;
export declare const updateLocation: (reqBody: llm.Location, reqSession: Express.SessionData) => boolean;
export declare const deleteLocation: (locationID: number, reqSession: Express.SessionData) => boolean;
export declare const restoreLocation: (locationID: number, reqSession: Express.SessionData) => boolean;
export declare const mergeLocations: (targetLocationID: number, sourceLocationID: number, reqSession: Express.SessionData) => boolean;
export declare const getInactiveLocations: (inactiveYears: number) => llm.Location[];
