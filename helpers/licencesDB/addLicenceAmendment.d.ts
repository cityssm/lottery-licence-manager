import sqlite from "better-sqlite3";
import type * as expressSession from "express-session";
export declare const addLicenceAmendmentWithDB: (database: sqlite.Database, licenceID: number | string, amendmentType: string, amendment: string, isHidden: number, requestSession: expressSession.Session) => number;
