import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
import * as configFunctions from '../functions.config.js';
import { resetEventTableStats, resetLicenceTableStats } from '../licencesDB.js';
import { addLicenceTicketTypeWithDB } from './addLicenceTicketType.js';
import { createEventWithDB } from './createEvent.js';
import { getLicenceWithDB } from './getLicence.js';
export default function createLicence(requestBody, requestUser) {
    const database = sqlite(databasePath);
    const nowDate = new Date();
    const nowMillis = nowDate.getTime();
    const nowDateInt = dateTimeFns.dateToInteger(nowDate);
    let externalLicenceNumberInteger = -1;
    try {
        externalLicenceNumberInteger = Number.parseInt(requestBody.externalLicenceNumber, 10);
    }
    catch {
        externalLicenceNumberInteger = -1;
    }
    const info = database
        .prepare(`insert into LotteryLicences (
        organizationID, applicationDate, licenceTypeKey,
        startDate, endDate, startTime, endTime,
        locationID, municipality,
        licenceDetails, termsConditions, totalPrizeValue,
        externalLicenceNumber, externalLicenceNumberInteger,
        recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(requestBody.organizationID, dateTimeFns.dateStringToInteger(requestBody.applicationDateString), requestBody.licenceTypeKey, dateTimeFns.dateStringToInteger(requestBody.startDateString), dateTimeFns.dateStringToInteger(requestBody.endDateString), dateTimeFns.timeStringToInteger(requestBody.startTimeString), dateTimeFns.timeStringToInteger(requestBody.endTimeString), requestBody.locationID === '' ? undefined : requestBody.locationID, requestBody.municipality, requestBody.licenceDetails, requestBody.termsConditions, requestBody.totalPrizeValue, requestBody.externalLicenceNumber, externalLicenceNumberInteger, requestUser.userName, nowMillis, requestUser.userName, nowMillis);
    const licenceID = Number(info.lastInsertRowid);
    const fieldKeys = requestBody.fieldKeys.slice(1).split(',');
    for (const fieldKey of fieldKeys) {
        const fieldValue = requestBody[fieldKey];
        if (fieldKey === '' || fieldValue === '') {
            continue;
        }
        database
            .prepare(`insert into LotteryLicenceFields
          (licenceID, fieldKey, fieldValue)
          values (?, ?, ?)`)
            .run(licenceID, fieldKey, fieldValue);
    }
    let eventDateStrings_toAdd;
    if (typeof requestBody.eventDateString === 'string') {
        eventDateStrings_toAdd = [requestBody.eventDateString];
    }
    else if (typeof requestBody.eventDateString === 'object') {
        eventDateStrings_toAdd = requestBody.eventDateString;
    }
    if (eventDateStrings_toAdd) {
        for (const eventDate of eventDateStrings_toAdd) {
            createEventWithDB(database, licenceID, eventDate, requestUser);
        }
    }
    if (typeof requestBody.ticketType_ticketType === 'string') {
        addLicenceTicketTypeWithDB(database, {
            licenceID,
            ticketTypeIndex: 0,
            amendmentDate: nowDateInt,
            ticketType: requestBody.ticketType_ticketType,
            unitCount: requestBody.ticketType_unitCount,
            licenceFee: requestBody.ticketType_licenceFee,
            distributorLocationID: requestBody.ticketType_distributorLocationID,
            manufacturerLocationID: requestBody.ticketType_manufacturerLocationID
        }, requestUser);
    }
    else if (typeof requestBody.ticketType_ticketType === 'object') {
        for (const [ticketTypeIndex, ticketType] of requestBody.ticketType_ticketType.entries()) {
            const ticketTypeDefinition = {
                licenceID,
                ticketTypeIndex,
                amendmentDate: nowDateInt,
                ticketType,
                unitCount: requestBody.ticketType_unitCount[ticketTypeIndex],
                licenceFee: requestBody.ticketType_licenceFee[ticketTypeIndex],
                distributorLocationID: requestBody.ticketType_distributorLocationID[ticketTypeIndex],
                manufacturerLocationID: requestBody.ticketType_manufacturerLocationID[ticketTypeIndex]
            };
            addLicenceTicketTypeWithDB(database, ticketTypeDefinition, requestUser);
        }
    }
    const licenceObject = getLicenceWithDB(database, licenceID, requestUser, {
        includeTicketTypes: true,
        includeFields: true,
        includeEvents: true,
        includeAmendments: true,
        includeTransactions: true
    });
    const feeCalculation = configFunctions.getProperty('licences.feeCalculationFn')(licenceObject);
    database
        .prepare('update LotteryLicences set licenceFee = ? where licenceID = ?')
        .run(feeCalculation.fee, licenceID);
    database.close();
    resetLicenceTableStats();
    resetEventTableStats();
    return licenceID;
}
