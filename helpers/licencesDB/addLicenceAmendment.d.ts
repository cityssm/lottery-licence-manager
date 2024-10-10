import type sqlite from 'better-sqlite3';
import type { User } from '../../types/recordTypes.js';
export declare function addLicenceAmendmentWithDB(database: sqlite.Database, licenceAmendment: {
    licenceID: number | string;
    amendmentType: string;
    amendment: string;
    isHidden: number;
}, requestUser: User): number;
