/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
import * as sqlite from "better-sqlite3";
export declare const addLicenceAmendmentWithDB: (db: sqlite.Database, licenceID: number | string, amendmentType: string, amendment: string, isHidden: number, reqSession: Express.SessionData) => number;
