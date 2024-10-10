import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
export default function createLocation(requestBody, requestUser) {
    const database = sqlite(databasePath);
    const nowMillis = Date.now();
    const info = database
        .prepare(`insert into Locations (
        locationName,
        locationAddress1, locationAddress2,
        locationCity, locationProvince, locationPostalCode,
        locationIsDistributor, locationIsManufacturer,
        recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(requestBody.locationName, requestBody.locationAddress1, requestBody.locationAddress2, requestBody.locationCity, requestBody.locationProvince, requestBody.locationPostalCode, requestBody.locationIsDistributor || 0, requestBody.locationIsManufacturer || 0, requestUser.userName, nowMillis, requestUser.userName, nowMillis);
    database.close();
    return info.lastInsertRowid;
}
