import type * as llm from "../../types/recordTypes";
export declare const getLocations: (reqSession: any, queryOptions: {
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
