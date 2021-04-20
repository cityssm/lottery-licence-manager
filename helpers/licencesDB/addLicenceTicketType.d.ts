import sqlite from "better-sqlite3";
import type * as expressSession from "express-session";
export declare const addLicenceTicketTypeWithDB: (db: sqlite.Database, ticketTypeDef: {
    licenceID: number | string;
    ticketTypeIndex: number | string;
    amendmentDate?: number | string;
    ticketType: string;
    unitCount: number | string;
    licenceFee: number | string;
    distributorLocationID?: number | string;
    manufacturerLocationID?: number | string;
}, reqSession: expressSession.Session) => void;
