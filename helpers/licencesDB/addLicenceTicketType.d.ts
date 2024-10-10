import type sqlite from 'better-sqlite3';
import type { User } from '../../types/recordTypes.js';
export declare function addLicenceTicketTypeWithDB(database: sqlite.Database, ticketTypeDefinition: {
    licenceID: number | string;
    ticketTypeIndex: number | string;
    amendmentDate?: number | string;
    ticketType: string;
    unitCount: number | string;
    licenceFee: number | string;
    distributorLocationID?: number | string;
    manufacturerLocationID?: number | string;
}, requestUser: User): void;
