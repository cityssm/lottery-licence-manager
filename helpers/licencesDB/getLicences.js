import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
import { canUpdateObject } from '../licencesDB.js';
export default function getLicences(requestBodyOrParametersObject, requestSession, includeOptions) {
    if ((requestBodyOrParametersObject.organizationName ?? '') !== '') {
        includeOptions.includeOrganization = true;
    }
    const database = sqlite(databasePath, {
        readonly: true
    });
    const sqlParameters = [];
    let sqlWhereClause = ' where l.recordDelete_timeMillis is null';
    if ((requestBodyOrParametersObject.externalLicenceNumber ?? '') !== '') {
        const externalLicenceNumberPieces = (requestBodyOrParametersObject.externalLicenceNumber ?? '')
            .toLowerCase()
            .split(' ');
        for (const externalLicenceNumberPiece of externalLicenceNumberPieces) {
            sqlWhereClause += ' and instr(lower(l.externalLicenceNumber), ?)';
            sqlParameters.push(externalLicenceNumberPiece);
        }
    }
    if ((requestBodyOrParametersObject.organizationID ?? '') !== '') {
        sqlWhereClause += ' and l.organizationID = ?';
        sqlParameters.push(requestBodyOrParametersObject.organizationID);
    }
    if ((requestBodyOrParametersObject.organizationName ?? '') !== '') {
        const organizationNamePieces = (requestBodyOrParametersObject.organizationName ?? '')
            .toLowerCase()
            .split(' ');
        for (const organizationNamePiece of organizationNamePieces) {
            sqlWhereClause += ' and instr(lower(o.organizationName), ?)';
            sqlParameters.push(organizationNamePiece);
        }
    }
    if ((requestBodyOrParametersObject.licenceTypeKey ?? '') !== '') {
        sqlWhereClause += ' and l.licenceTypeKey = ?';
        sqlParameters.push(requestBodyOrParametersObject.licenceTypeKey);
    }
    if (requestBodyOrParametersObject.licenceStatus) {
        if (requestBodyOrParametersObject.licenceStatus === 'past') {
            sqlWhereClause += ' and l.endDate < ?';
            sqlParameters.push(dateTimeFns.dateToInteger(new Date()));
        }
        else if (requestBodyOrParametersObject.licenceStatus === 'active') {
            sqlWhereClause += ' and l.endDate >= ?';
            sqlParameters.push(dateTimeFns.dateToInteger(new Date()));
        }
    }
    if (requestBodyOrParametersObject.locationID) {
        sqlWhereClause += ` and (
        l.locationID = ?
        or l.licenceID in (
          select licenceID from LotteryLicenceTicketTypes
          where recordDelete_timeMillis is null
          and (distributorLocationID = ? or manufacturerLocationID = ?)
        )
      )`;
        sqlParameters.push(requestBodyOrParametersObject.locationID, requestBodyOrParametersObject.locationID, requestBodyOrParametersObject.locationID);
    }
    if ((requestBodyOrParametersObject.locationName ?? '') !== '') {
        const locationNamePieces = (requestBodyOrParametersObject.locationName ?? '')
            .toLowerCase()
            .split(' ');
        for (const locationNamePiece of locationNamePieces) {
            sqlWhereClause +=
                ' and (instr(lower(lo.locationName), ?) or instr(lower(lo.locationAddress1), ?))';
            sqlParameters.push(locationNamePiece, locationNamePiece);
        }
    }
    let count = 0;
    if (includeOptions.limit !== -1) {
        count = database
            .prepare(`select ifnull(count(*), 0)
          from LotteryLicences l
          left join Organizations o on l.organizationID = o.organizationID
          left join Locations lo on l.locationID = lo.locationID
          ${sqlWhereClause}`)
            .pluck()
            .get(sqlParameters);
    }
    let sql = `select 'licence' as recordType,
      l.licenceID, l.organizationID,
      ${includeOptions.includeOrganization ? ' o.organizationName,' : ''}
      l.applicationDate, userFn_dateIntegerToString(l.applicationDate) as applicationDateString,
      l.licenceTypeKey,
      l.startDate, userFn_dateIntegerToString(l.startDate) as startDateString,
      l.startTime, userFn_timeIntegerToString(l.startTime) as startTimeString,
      l.endDate, userFn_dateIntegerToString(l.endDate) as endDateString,
      l.endTime, userFn_timeIntegerToString(l.endTime) as endTimeString,
      l.locationID, lo.locationName,
      lo.locationAddress1, iif(lo.locationName = '', lo.locationAddress1, lo.locationName) as locationDisplayName,
      l.municipality, l.licenceDetails, l.termsConditions, l.externalLicenceNumber,
      l.issueDate, userFn_dateIntegerToString(l.issueDate) as issueDateString,
      l.recordCreate_userName, l.recordCreate_timeMillis,
      l.recordUpdate_userName, l.recordUpdate_timeMillis
    from LotteryLicences l
    left join Locations lo on l.locationID = lo.locationID
    ${includeOptions.includeOrganization
        ? ' left join Organizations o on l.organizationID = o.organizationID'
        : ''}
    ${sqlWhereClause}
    order by l.endDate desc, l.startDate desc, l.licenceID`;
    if (includeOptions.limit !== -1) {
        sql += ` limit ${includeOptions.limit.toString()} offset ${(includeOptions.offset ?? 0).toString()}`;
    }
    database.function('userFn_dateIntegerToString', dateTimeFns.dateIntegerToString);
    database.function('userFn_timeIntegerToString', dateTimeFns.timeIntegerToString);
    const rows = database.prepare(sql).all(sqlParameters);
    database.close();
    for (const element of rows) {
        element.canUpdate = canUpdateObject(element, requestSession);
    }
    return {
        count: includeOptions.limit === -1 ? rows.length : count,
        licences: rows
    };
}
