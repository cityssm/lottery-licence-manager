import type sqlite from 'better-sqlite3';
export declare function getMaxTransactionIndexWithDB(database: sqlite.Database, licenceID: number | string): number;
