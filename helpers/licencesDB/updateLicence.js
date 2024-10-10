import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
import * as configFunctions from '../functions.config.js';
import { resetEventTableStats, resetLicenceTableStats } from '../licencesDB.js';
import { addLicenceAmendmentWithDB } from './addLicenceAmendment.js';
import { addLicenceTicketTypeWithDB } from './addLicenceTicketType.js';
import { createEventWithDB } from './createEvent.js';
import { deleteLicenceTicketTypeWithDB } from './deleteLicenceTicketType.js';
import { getLicenceWithDB } from './getLicence.js';
import { getMaxLicenceTicketTypeIndexWithDB } from './getMaxLicenceTicketTypeIndex.js';
export const parseTicketTypeKey = (unparsedTicketTypeKey) => {
    const eventDateString = unparsedTicketTypeKey.slice(0, 10);
    return {
        eventDate: dateTimeFns.dateStringToInteger(eventDateString),
        eventDateString,
        ticketType: unparsedTicketTypeKey.slice(11)
    };
};
export default function updateLicence(requestBody, requestUser) {
    const database = sqlite(databasePath);
    const pastLicenceObject = getLicenceWithDB(database, requestBody.licenceID, requestUser, {
        includeTicketTypes: true,
        includeFields: true,
        includeEvents: true,
        includeAmendments: false,
        includeTransactions: true
    });
    if (!pastLicenceObject?.canUpdate) {
        database.close();
        return false;
    }
    const nowDate = new Date();
    const nowDateInt = dateTimeFns.dateToInteger(nowDate);
    const nowMillis = nowDate.getTime();
    let externalLicenceNumberInteger = Number.parseInt(requestBody.externalLicenceNumber, 10);
    if (Number.isNaN(externalLicenceNumberInteger)) {
        externalLicenceNumberInteger = -1;
    }
    const startDate_now = dateTimeFns.dateStringToInteger(requestBody.startDateString);
    const endDate_now = dateTimeFns.dateStringToInteger(requestBody.endDateString);
    const startTime_now = dateTimeFns.timeStringToInteger(requestBody.startTimeString);
    const endTime_now = dateTimeFns.timeStringToInteger(requestBody.endTimeString);
    const changeCount = database
        .prepare(`update LotteryLicences
        set organizationID = ?,
          applicationDate = ?,
          licenceTypeKey = ?,
          startDate = ?,
          endDate = ?,
          startTime = ?,
          endTime = ?,
          locationID = ?,
          municipality = ?,
          licenceDetails = ?,
          termsConditions = ?,
          totalPrizeValue = ?,
          licenceFee = ?,
          externalLicenceNumber = ?,
          externalLicenceNumberInteger = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where licenceID = ?
          and recordDelete_timeMillis is null`)
        .run(requestBody.organizationID, dateTimeFns.dateStringToInteger(requestBody.applicationDateString), requestBody.licenceTypeKey, startDate_now, endDate_now, startTime_now, endTime_now, requestBody.locationID === '' ? undefined : requestBody.locationID, requestBody.municipality, requestBody.licenceDetails, requestBody.termsConditions, requestBody.totalPrizeValue, requestBody.licenceFee, requestBody.externalLicenceNumber, externalLicenceNumberInteger, requestUser.userName, nowMillis, requestBody.licenceID).changes;
    if (!changeCount) {
        database.close();
        return false;
    }
    if (pastLicenceObject.trackUpdatesAsAmendments) {
        if (configFunctions.getProperty('amendments.trackDateTimeUpdate') &&
            (pastLicenceObject.startDate !== startDate_now ||
                pastLicenceObject.endDate !== endDate_now ||
                pastLicenceObject.startTime !== startTime_now ||
                pastLicenceObject.endTime !== endTime_now)) {
            const amendment = ((pastLicenceObject.startDate === startDate_now
                ? ''
                : `Start Date: ${pastLicenceObject.startDate.toString()} -> ${startDate_now.toString()}` +
                    '\n') +
                (pastLicenceObject.endDate === endDate_now
                    ? ''
                    : `End Date: ${pastLicenceObject.endDate.toString()} -> ${endDate_now.toString()}` +
                        '\n') +
                (pastLicenceObject.startTime === startTime_now
                    ? ''
                    : `Start Time: ${pastLicenceObject.startTime.toString()} -> ${startTime_now.toString()}` +
                        '\n') +
                (pastLicenceObject.endTime === endTime_now
                    ? ''
                    : `End Time: ${pastLicenceObject.endTime.toString()} -> ${endTime_now.toString()}` +
                        '\n')).trim();
            addLicenceAmendmentWithDB(database, {
                licenceID: requestBody.licenceID,
                amendmentType: 'Date Update',
                amendment,
                isHidden: 0
            }, requestUser);
        }
        if (pastLicenceObject.organizationID !==
            Number.parseInt(requestBody.organizationID, 10) &&
            configFunctions.getProperty('amendments.trackOrganizationUpdate')) {
            addLicenceAmendmentWithDB(database, {
                licenceID: requestBody.licenceID,
                amendmentType: 'Organization Change',
                amendment: '',
                isHidden: 0
            }, requestUser);
        }
        if (pastLicenceObject.locationID !==
            Number.parseInt(requestBody.locationID, 10) &&
            configFunctions.getProperty('amendments.trackLocationUpdate')) {
            addLicenceAmendmentWithDB(database, {
                licenceID: requestBody.licenceID,
                amendmentType: 'Location Change',
                amendment: '',
                isHidden: 0
            }, requestUser);
        }
        if (pastLicenceObject.licenceFee !==
            Number.parseFloat(requestBody.licenceFee) &&
            configFunctions.getProperty('amendments.trackLicenceFeeUpdate')) {
            addLicenceAmendmentWithDB(database, {
                licenceID: requestBody.licenceID,
                amendmentType: 'Licence Fee Change',
                amendment: '$' +
                    pastLicenceObject.licenceFee.toFixed(2) +
                    ' -> $' +
                    Number.parseFloat(requestBody.licenceFee).toFixed(2),
                isHidden: 0
            }, requestUser);
        }
    }
    database
        .prepare('delete from LotteryLicenceFields where licenceID = ?')
        .run(requestBody.licenceID);
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
            .run(requestBody.licenceID, fieldKey, fieldValue);
    }
    if (requestBody.eventDateString !== undefined) {
        database
            .prepare(`delete from LotteryEventFields
          where licenceID = ?
          and eventDate in (select eventDate from LotteryEvents where licenceID = ? and recordDelete_timeMillis is not null)`)
            .run(requestBody.licenceID, requestBody.licenceID);
        database
            .prepare(`delete from LotteryEventCosts
          where licenceID = ?
          and eventDate in (select eventDate from LotteryEvents where licenceID = ? and recordDelete_timeMillis is not null)`)
            .run(requestBody.licenceID, requestBody.licenceID);
        database
            .prepare(`delete from LotteryEvents
          where licenceID = ?
          and recordDelete_timeMillis is not null`)
            .run(requestBody.licenceID);
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
            createEventWithDB(database, requestBody.licenceID, eventDate, requestUser);
        }
    }
    let ticketTypeIndexes_toDelete;
    if (typeof requestBody.ticketTypeIndex_toDelete === 'string') {
        ticketTypeIndexes_toDelete = [requestBody.ticketTypeIndex_toDelete];
    }
    else if (typeof requestBody.ticketTypeIndex_toDelete === 'object') {
        ticketTypeIndexes_toDelete = requestBody.ticketTypeIndex_toDelete;
    }
    if (ticketTypeIndexes_toDelete) {
        for (const ticketTypeIndex_toDelete of ticketTypeIndexes_toDelete) {
            deleteLicenceTicketTypeWithDB(database, {
                licenceID: requestBody.licenceID,
                ticketTypeIndex: ticketTypeIndex_toDelete
            }, requestUser);
            if (pastLicenceObject.trackUpdatesAsAmendments &&
                configFunctions.getProperty('amendments.trackTicketTypeDelete')) {
                addLicenceAmendmentWithDB(database, {
                    licenceID: requestBody.licenceID,
                    amendmentType: 'Ticket Type Removed',
                    amendment: `Removed ${ticketTypeIndex_toDelete}.`,
                    isHidden: 0
                }, requestUser);
            }
        }
    }
    if (typeof requestBody.ticketType_ticketType === 'string') {
        const newTicketTypeIndex = getMaxLicenceTicketTypeIndexWithDB(database, requestBody.licenceID) + 1;
        addLicenceTicketTypeWithDB(database, {
            licenceID: requestBody.licenceID,
            ticketTypeIndex: newTicketTypeIndex,
            amendmentDate: nowDateInt,
            ticketType: requestBody.ticketType_ticketType,
            unitCount: requestBody.ticketType_unitCount,
            licenceFee: requestBody.ticketType_licenceFee,
            distributorLocationID: requestBody.ticketType_distributorLocationID,
            manufacturerLocationID: requestBody.ticketType_manufacturerLocationID
        }, requestUser);
        if (pastLicenceObject.trackUpdatesAsAmendments &&
            configFunctions.getProperty('amendments.trackTicketTypeNew')) {
            addLicenceAmendmentWithDB(database, {
                licenceID: requestBody.licenceID,
                amendmentType: 'Added Ticket Type',
                amendment: requestBody.ticketType_ticketType,
                isHidden: 0
            }, requestUser);
        }
    }
    else if (typeof requestBody.ticketType_ticketType === 'object') {
        const newTicketTypeIndex = getMaxLicenceTicketTypeIndexWithDB(database, requestBody.licenceID) + 1;
        for (const [ticketTypeIndex, ticketType] of requestBody.ticketType_ticketType.entries()) {
            addLicenceTicketTypeWithDB(database, {
                licenceID: requestBody.licenceID,
                ticketTypeIndex: newTicketTypeIndex + ticketTypeIndex,
                amendmentDate: nowDateInt,
                ticketType,
                unitCount: requestBody.ticketType_unitCount[ticketTypeIndex],
                licenceFee: requestBody.ticketType_licenceFee[ticketTypeIndex],
                distributorLocationID: requestBody.ticketType_distributorLocationID[ticketTypeIndex],
                manufacturerLocationID: requestBody.ticketType_manufacturerLocationID[ticketTypeIndex]
            }, requestUser);
            if (pastLicenceObject.trackUpdatesAsAmendments &&
                configFunctions.getProperty('amendments.trackTicketTypeNew')) {
                addLicenceAmendmentWithDB(database, {
                    licenceID: requestBody.licenceID,
                    amendmentType: 'Added Ticket Type',
                    amendment: ticketType,
                    isHidden: 0
                }, requestUser);
            }
        }
    }
    database.close();
    resetLicenceTableStats();
    resetEventTableStats();
    return changeCount > 0;
}
