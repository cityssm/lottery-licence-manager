import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
import { addLicenceAmendmentWithDB } from './addLicenceAmendment.js';
import { getLicenceWithDB } from './getLicence.js';
export default function voidTransaction(licenceID, transactionIndex, requestUser) {
    const database = sqlite(databasePath);
    const licenceObject = getLicenceWithDB(database, licenceID, requestUser, {
        includeTicketTypes: false,
        includeFields: false,
        includeEvents: false,
        includeAmendments: false,
        includeTransactions: false
    });
    const nowMillis = Date.now();
    const hasChanges = database
        .prepare(`update LotteryLicenceTransactions
          set recordDelete_userName = ?,
            recordDelete_timeMillis = ?
          where licenceID = ?
            and transactionIndex = ?
            and recordDelete_timeMillis is null`)
        .run(requestUser.userName, nowMillis, licenceID, transactionIndex)
        .changes > 0;
    if (hasChanges && licenceObject?.trackUpdatesAsAmendments) {
        addLicenceAmendmentWithDB(database, {
            licenceID,
            amendmentType: 'Transaction Voided',
            amendment: '',
            isHidden: 1
        }, requestUser);
    }
    database.close();
    return hasChanges;
}
