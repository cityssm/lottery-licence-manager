import sqlite from 'better-sqlite3';
import type * as expressSession from 'express-session';
import type * as llm from '../../types/recordTypes';
export declare function getLicenceWithDB(database: sqlite.Database, licenceID: number | string, requestSession: expressSession.Session, queryOptions?: {
    includeTicketTypes?: boolean;
    includeFields?: boolean;
    includeEvents?: boolean;
    includeAmendments?: boolean;
    includeTransactions?: boolean;
}): llm.LotteryLicence | undefined;
export default function getLicence(licenceID: number, requestSession: expressSession.Session): llm.LotteryLicence | undefined;
