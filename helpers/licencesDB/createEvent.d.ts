import * as sqlite from "better-sqlite3";
import type * as expressSession from "express-session";
export declare const createEventWithDB: (db: sqlite.Database, licenceID: string | number, eventDateString: string, reqSession: expressSession.Session) => void;
