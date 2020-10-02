/// <reference types="csurf" />
/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-rate-limit" />
/// <reference types="express-session" />
import * as llm from "../../types/recordTypes";
export declare const createLocation: (reqBody: llm.Location, reqSession: Express.SessionData) => number;
