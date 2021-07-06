import type * as expressSession from "express-session";
import type * as sqlite from "better-sqlite3";
export declare const deleteLicenceTicketTypeWithDB: (database: sqlite.Database, ticketTypeDefinition: {
    licenceID: number | string;
    ticketTypeIndex: number | string;
}, requestSession: expressSession.Session) => sqlite.RunResult;
