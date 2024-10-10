import type sqlite from 'better-sqlite3';
export declare function getMaxOrganizationBankRecordIndexWithDB(database: sqlite.Database, organizationID: number | string): number;
