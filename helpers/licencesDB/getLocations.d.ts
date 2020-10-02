/// <reference types="csurf" />
/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-rate-limit" />
/// <reference types="express-session" />
import type * as llm from "../../types/recordTypes";
export declare const getLocations: (reqSession: Express.SessionData, queryOptions: {
    limit: number;
    offset: number;
    locationNameAddress?: string;
    locationIsDistributor: number;
    locationIsManufacturer: number;
    locationIsActive?: "on";
}) => {
    count: number;
    locations: llm.Location[];
};
