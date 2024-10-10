import type sqlite from 'better-sqlite3';
import type { LotteryLicenceAmendment } from '../../types/recordTypes.js';
export declare function getLicenceAmendmentsWithDB(database: sqlite.Database, licenceID: number | string): LotteryLicenceAmendment[];
