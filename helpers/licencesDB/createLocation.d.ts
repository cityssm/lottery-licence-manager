import * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const createLocation: (reqBody: llm.Location, reqSession: expressSession.Session) => number;
