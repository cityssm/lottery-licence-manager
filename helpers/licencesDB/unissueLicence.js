import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
import { addLicenceAmendmentWithDB } from './addLicenceAmendment.js';
export default function unissueLicence(licenceID, requestUser) {
    const database = sqlite(databasePath);
    const nowMillis = Date.now();
    const info = database
        .prepare(`update LotteryLicences
        set issueDate = null,
        issueTime = null,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where licenceID = ?
        and recordDelete_timeMillis is null
        and issueDate is not null`)
        .run(requestUser.userName, nowMillis, licenceID);
    const changeCount = info.changes;
    if (changeCount) {
        addLicenceAmendmentWithDB(database, {
            licenceID,
            amendmentType: 'Unissue Licence',
            amendment: '',
            isHidden: 1
        }, requestUser);
    }
    database.close();
    return changeCount > 0;
}
