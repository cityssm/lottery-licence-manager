import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
import { addLicenceAmendmentWithDB } from './addLicenceAmendment.js';
import { getLicenceWithDB } from './getLicence.js';
import { getMaxTransactionIndexWithDB } from './getMaxTransactionIndex.js';
export default function addTransaction(requestBody, requestUser) {
    const database = sqlite(databasePath);
    const licenceObject = getLicenceWithDB(database, requestBody.licenceID, requestUser, {
        includeTicketTypes: false,
        includeFields: false,
        includeEvents: false,
        includeAmendments: false,
        includeTransactions: false
    });
    const newTransactionIndex = getMaxTransactionIndexWithDB(database, requestBody.licenceID) + 1;
    const rightNow = new Date();
    const transactionDate = dateTimeFns.dateToInteger(rightNow);
    const transactionTime = dateTimeFns.dateToTimeInteger(rightNow);
    database
        .prepare(`insert into LotteryLicenceTransactions (
        licenceID, transactionIndex,
        transactionDate, transactionTime,
        externalReceiptNumber, transactionAmount, transactionNote,
        recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(requestBody.licenceID, newTransactionIndex, transactionDate, transactionTime, requestBody.externalReceiptNumber, requestBody.transactionAmount, requestBody.transactionNote, requestUser.userName, rightNow.getTime(), requestUser.userName, rightNow.getTime());
    if (licenceObject?.trackUpdatesAsAmendments) {
        addLicenceAmendmentWithDB(database, {
            licenceID: requestBody.licenceID,
            amendmentType: 'New Transaction',
            amendment: '',
            isHidden: 1
        }, requestUser);
    }
    if (requestBody.issueLicence === 'true') {
        database
            .prepare(`update LotteryLicences
          set issueDate = ?,
            issueTime = ?,
            trackUpdatesAsAmendments = 1,
            recordUpdate_userName = ?,
            recordUpdate_timeMillis = ?
            where licenceID = ?
            and recordDelete_timeMillis is null
            and issueDate is null`)
            .run(transactionDate, transactionTime, requestUser.userName, rightNow.getTime(), requestBody.licenceID);
    }
    database.close();
    return newTransactionIndex;
}
