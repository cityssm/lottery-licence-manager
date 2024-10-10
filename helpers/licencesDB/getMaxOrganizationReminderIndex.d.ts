import type sqlite from 'better-sqlite3';
export declare function getMaxOrganizationReminderIndexWithDB(database: sqlite.Database, organizationID: number | string): number;
