import type * as expressSession from "express-session";
import type * as sqlite from "better-sqlite3";
export declare const deleteLicenceTicketTypeWithDB: (db: sqlite.Database, ticketTypeDef: {
    licenceID: string | number;
    eventDate: number | string;
    ticketType: string;
}, reqSession: expressSession.Session) => sqlite.RunResult;
