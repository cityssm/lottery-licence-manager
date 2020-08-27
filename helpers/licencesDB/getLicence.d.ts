/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
import * as sqlite from "better-sqlite3";
import type * as llm from "../../types/recordTypes";
export declare const getLicenceWithDB: (db: sqlite.Database, licenceID: number | string, reqSession: Express.SessionData, queryOptions: {
    includeTicketTypes: boolean;
    includeFields: boolean;
    includeEvents: boolean;
    includeAmendments: boolean;
    includeTransactions: boolean;
}) => llm.LotteryLicence;
export declare const getLicence: (licenceID: number, reqSession: Express.SessionData) => llm.LotteryLicence;
