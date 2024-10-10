import type * as sqlite from 'better-sqlite3';
import type { User } from '../../types/recordTypes.js';
export declare function deleteLicenceTicketTypeWithDB(database: sqlite.Database, ticketTypeDefinition: {
    licenceID: number | string;
    ticketTypeIndex: number | string;
}, requestUser: User): sqlite.RunResult;
