import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getOutstandingEvents: (reqBody: {
    eventDateType?: string;
    licenceTypeKey?: string;
}, reqSession: expressSession.Session) => llm.LotteryEvent[];
