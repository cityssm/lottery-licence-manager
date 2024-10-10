import type * as sqlite from 'better-sqlite3';
import type { User } from '../../types/recordTypes.js';
export declare function createEventWithDB(database: sqlite.Database, licenceID: string | number, eventDateString: string, requestUser: User): void;
