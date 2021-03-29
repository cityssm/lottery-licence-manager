import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getEvents: (reqBody: {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationName?: string;
    locationName?: string;
    eventYear?: string;
}, reqSession: expressSession.Session) => llm.LotteryEvent[];
