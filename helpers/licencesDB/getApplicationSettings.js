import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
export default function getApplicationSettings() {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const rows = database
        .prepare('select * from ApplicationSettings order by orderNumber, settingKey')
        .all();
    database.close();
    return rows;
}
