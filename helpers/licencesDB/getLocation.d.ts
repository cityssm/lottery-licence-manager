/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
import * as llm from "../../types/recordTypes";
export declare const getLocation: (locationID: number, reqSession: Express.SessionData) => llm.Location;
