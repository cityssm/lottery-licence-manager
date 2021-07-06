import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getLocation: (locationID: number, requestSession: expressSession.Session) => llm.Location;
