import * as sqlite from "better-sqlite3";
import type * as expressSession from "express-session";
export declare const addLicenceTicketTypeWithDB: (db: sqlite.Database, ticketTypeDef: {
    licenceID: number | string;
    eventDate: number | string;
    ticketType: string;
}, reqSession: expressSession.Session) => void;
