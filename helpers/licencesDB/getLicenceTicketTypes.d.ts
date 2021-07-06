import sqlite from "better-sqlite3";
import type * as llm from "../../types/recordTypes";
export declare const getLicenceTicketTypesWithDB: (database: sqlite.Database, licenceID: number | string) => llm.LotteryLicenceTicketType[];
