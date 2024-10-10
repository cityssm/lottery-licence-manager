import type sqlite from 'better-sqlite3';
import type { LotteryLicenceTicketType } from '../../types/recordTypes.js';
export declare function getLicenceTicketTypesWithDB(database: sqlite.Database, licenceID: number | string): LotteryLicenceTicketType[];
