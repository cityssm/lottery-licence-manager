import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
interface GetEventsReturn {
    count: number;
    events: llm.LotteryEvent[];
}
export declare const getEvents: (requestBody: {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationName?: string;
    locationName?: string;
    eventYear?: string;
}, requestSession: expressSession.Session, options: {
    limit: number;
    offset: number;
}) => GetEventsReturn;
export {};
