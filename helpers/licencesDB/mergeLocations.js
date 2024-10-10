import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
export default function mergeLocations(targetLocationID, sourceLocationID, requestUser) {
    const database = sqlite(databasePath);
    const nowMillis = Date.now();
    const locationAttributes = database
        .prepare(`select max(locationIsDistributor) as locationIsDistributorMax,
        max(locationIsManufacturer) as locationIsManufacturerMax,
        count(locationID) as locationCount
        from Locations
        where recordDelete_timeMillis is null
        and (locationID = ? or locationID = ?)`)
        .get(targetLocationID, sourceLocationID);
    if (locationAttributes === undefined) {
        database.close();
        return false;
    }
    if (locationAttributes.locationCount !== 2) {
        database.close();
        return false;
    }
    database
        .prepare(`update Locations
        set locationIsDistributor = ?,
        locationIsManufacturer = ?
        where locationID = ?`)
        .run(locationAttributes.locationIsDistributorMax, locationAttributes.locationIsManufacturerMax, targetLocationID);
    database
        .prepare(`update LotteryLicences
        set locationID = ?
        where locationID = ?
        and recordDelete_timeMillis is null`)
        .run(targetLocationID, sourceLocationID);
    database
        .prepare(`update LotteryLicenceTicketTypes
        set distributorLocationID = ?
        where distributorLocationID = ?
        and recordDelete_timeMillis is null`)
        .run(targetLocationID, sourceLocationID);
    database
        .prepare(`update LotteryLicenceTicketTypes
        set manufacturerLocationID = ?
        where manufacturerLocationID = ?
        and recordDelete_timeMillis is null`)
        .run(targetLocationID, sourceLocationID);
    database
        .prepare(`update Locations
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where locationID = ?`)
        .run(requestUser.userName, nowMillis, sourceLocationID);
    database.close();
    return true;
}
