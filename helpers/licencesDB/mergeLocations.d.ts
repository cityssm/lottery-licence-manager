/// <reference types="csurf" />
/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-rate-limit" />
/// <reference types="express-session" />
export declare const mergeLocations: (targetLocationID: number, sourceLocationID: number, reqSession: Express.SessionData) => boolean;
