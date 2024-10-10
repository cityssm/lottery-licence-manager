import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
export default function deleteOrganizationRepresentative(organizationID, representativeIndex) {
    const database = sqlite(databasePath);
    const info = database
        .prepare(`delete from OrganizationRepresentatives
        where organizationID = ?
        and representativeIndex = ?`)
        .run(organizationID, representativeIndex);
    database.close();
    return info.changes > 0;
}
