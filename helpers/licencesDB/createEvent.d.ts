import type { Session } from "express-session";
import type * as sqlite from "better-sqlite3";
export declare const createEventWithDB: (database: sqlite.Database, licenceID: string | number, eventDateString: string, requestSession: Session) => void;
