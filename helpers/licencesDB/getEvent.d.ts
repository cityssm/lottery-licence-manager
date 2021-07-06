import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getEvent: (licenceID: number, eventDate: number, requestSession: expressSession.Session) => llm.LotteryEvent;
export default getEvent;
