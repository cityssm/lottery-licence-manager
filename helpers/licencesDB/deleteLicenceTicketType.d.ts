import * as sqlite from "better-sqlite3";
import type * as expressSession from "express-session";
export declare const deleteLicenceTicketTypeWithDB: (db: sqlite.Database, ticketTypeDef: {
    licenceID: string | number;
    eventDate: number | string;
    ticketType: string;
}, reqSession: expressSession.Session) => void;
