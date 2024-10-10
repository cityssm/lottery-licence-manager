import sqlite from 'better-sqlite3';
import type { LotteryLicence, User } from '../../types/recordTypes.js';
export declare function getLicenceWithDB(database: sqlite.Database, licenceID: number | string, requestUser: User, queryOptions?: {
    includeTicketTypes?: boolean;
    includeFields?: boolean;
    includeEvents?: boolean;
    includeAmendments?: boolean;
    includeTransactions?: boolean;
}): LotteryLicence | undefined;
export default function getLicence(licenceID: number, requestUser: User): LotteryLicence | undefined;
