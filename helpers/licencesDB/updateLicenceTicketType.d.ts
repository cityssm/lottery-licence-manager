import type sqlite from "better-sqlite3";
import type * as expressSession from "express-session";
export declare const updateLicenceTicketTypeWithDB: (database: sqlite.Database, ticketTypeDefinition: {
    licenceID: number | string;
    eventDateString: string;
    ticketType: string;
    unitCount: number | string;
    licenceFee: number | string;
    distributorLocationID: number | string;
    manufacturerLocationID: number | string;
}, requestSession: expressSession.Session) => void;
