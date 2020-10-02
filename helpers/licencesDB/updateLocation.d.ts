/// <reference types="csurf" />
/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-rate-limit" />
/// <reference types="express-session" />
import type * as llm from "../../types/recordTypes";
export declare const updateLocation: (reqBody: llm.Location, reqSession: Express.SessionData) => boolean;
