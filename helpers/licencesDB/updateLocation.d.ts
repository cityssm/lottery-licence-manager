import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const updateLocation: (reqBody: llm.Location, reqSession: expressSession.Session) => boolean;
