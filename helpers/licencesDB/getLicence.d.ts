import * as sqlite from "better-sqlite3";
import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getLicenceWithDB: (db: sqlite.Database, licenceID: number | string, reqSession: expressSession.Session, queryOptions: {
    includeTicketTypes: boolean;
    includeFields: boolean;
    includeEvents: boolean;
    includeAmendments: boolean;
    includeTransactions: boolean;
}) => llm.LotteryLicence;
export declare const getLicence: (licenceID: number, reqSession: expressSession.Session) => llm.LotteryLicence;
