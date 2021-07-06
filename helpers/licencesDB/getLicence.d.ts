import sqlite from "better-sqlite3";
import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getLicenceWithDB: (database: sqlite.Database, licenceID: number | string, requestSession: expressSession.Session, queryOptions: {
    includeTicketTypes: boolean;
    includeFields: boolean;
    includeEvents: boolean;
    includeAmendments: boolean;
    includeTransactions: boolean;
}) => llm.LotteryLicence;
export declare const getLicence: (licenceID: number, requestSession: expressSession.Session) => llm.LotteryLicence;
export default getLicence;
