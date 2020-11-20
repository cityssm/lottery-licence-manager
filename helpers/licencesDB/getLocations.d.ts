import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getLocations: (reqSession: expressSession.Session, queryOptions: {
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
