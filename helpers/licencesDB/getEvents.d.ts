import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getEvents: (requestBody: {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationName?: string;
    locationName?: string;
    eventYear?: string;
}, requestSession: expressSession.Session) => llm.LotteryEvent[];
