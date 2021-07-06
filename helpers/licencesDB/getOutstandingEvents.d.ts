import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getOutstandingEvents: (requestBody: {
    eventDateType?: string;
    licenceTypeKey?: string;
}, requestSession: expressSession.Session) => llm.LotteryEvent[];
