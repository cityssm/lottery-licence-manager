import type * as sqlite from "better-sqlite3";
export declare const getMaxLicenceTicketTypeIndexWithDB: (db: sqlite.Database, licenceID: number | string) => number;