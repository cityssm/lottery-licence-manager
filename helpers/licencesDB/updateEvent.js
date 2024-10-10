import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
import * as licencesDB from '../licencesDB.js';
export default function updateEvent(requestBody, requestUser) {
    const database = sqlite(databasePath);
    const nowMillis = Date.now();
    const info = database
        .prepare(`update LotteryEvents
        set reportDate = ?,
          bank_name = ?,
          bank_address = ?,
          bank_accountNumber = ?,
          bank_accountBalance = ?,
          costs_amountDonated = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where licenceID = ?
          and eventDate = ?
          and recordDelete_timeMillis is null`)
        .run(requestBody.reportDateString === ''
        ? undefined
        : dateTimeFns.dateStringToInteger(requestBody.reportDateString), requestBody.bank_name, requestBody.bank_address, requestBody.bank_accountNumber, requestBody.bank_accountBalance === ''
        ? undefined
        : requestBody.bank_accountBalance, requestBody.costs_amountDonated === ''
        ? undefined
        : requestBody.costs_amountDonated, requestUser.userName, nowMillis, requestBody.licenceID, requestBody.eventDate);
    const changeCount = info.changes;
    if (!changeCount) {
        database.close();
        return false;
    }
    database
        .prepare(`delete from LotteryEventCosts
        where licenceID = ?
        and eventDate = ?`)
        .run(requestBody.licenceID, requestBody.eventDate);
    const ticketTypes = requestBody.ticketTypes.split(',');
    for (const ticketType of ticketTypes) {
        const costs_receipts = requestBody['costs_receipts-' + ticketType];
        const costs_admin = requestBody['costs_admin-' + ticketType];
        const costs_prizesAwarded = requestBody['costs_prizesAwarded-' + ticketType];
        database
            .prepare(`insert into LotteryEventCosts (
          licenceID, eventDate, ticketType, costs_receipts, costs_admin, costs_prizesAwarded)
          values (?, ?, ?, ?, ?, ?)`)
            .run(requestBody.licenceID, requestBody.eventDate, ticketType === '' ? undefined : ticketType, costs_receipts === '' ? undefined : costs_receipts, costs_admin === '' ? undefined : costs_admin, costs_prizesAwarded === '' ? undefined : costs_prizesAwarded);
    }
    database
        .prepare(`delete from LotteryEventFields
        where licenceID = ? and eventDate = ?`)
        .run(requestBody.licenceID, requestBody.eventDate);
    const fieldKeys = requestBody.fieldKeys.split(',');
    for (const fieldKey of fieldKeys) {
        const fieldValue = requestBody[fieldKey];
        if (fieldValue !== '') {
            database
                .prepare(`insert into LotteryEventFields (
            licenceID, eventDate, fieldKey, fieldValue)
            values (?, ?, ?, ?)`)
                .run(requestBody.licenceID, requestBody.eventDate, fieldKey, fieldValue);
        }
    }
    database.close();
    licencesDB.resetEventTableStats();
    return changeCount > 0;
}
