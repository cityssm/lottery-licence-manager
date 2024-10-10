import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
import { canUpdateObject } from '../licencesDB.js';
export default function getOrganizations(requestBody, requestUser, includeOptions) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const sqlParameters = [
        dateTimeFns.dateToInteger(new Date())
    ];
    let sql = `select o.organizationID, o.organizationName,
    o.isEligibleForLicences, o.organizationNote, r.representativeName,
    sum(case when l.endDate >= ? then 1 else 0 end) as licences_activeCount,
    max(l.endDate) as licences_endDateMax,
    o.recordCreate_userName, o.recordCreate_timeMillis,
    o.recordUpdate_userName, o.recordUpdate_timeMillis
    from Organizations o
    left join OrganizationRepresentatives r on o.organizationID = r.organizationID and r.isDefault = 1
    left join LotteryLicences l on o.organizationID = l.organizationID and l.recordDelete_timeMillis is null
    where o.recordDelete_timeMillis is null`;
    if ((requestBody.organizationName ?? '') !== '') {
        const organizationNamePieces = (requestBody.organizationName ?? '')
            .toLowerCase()
            .split(' ');
        for (const organizationPiece of organizationNamePieces) {
            sql += ' and instr(lower(o.organizationName), ?)';
            sqlParameters.push(organizationPiece);
        }
    }
    if ((requestBody.representativeName ?? '') !== '') {
        const representativeNamePieces = (requestBody.representativeName ?? '')
            .toLowerCase()
            .split(' ');
        for (const representativePiece of representativeNamePieces) {
            sql += ` and o.organizationID in (
        select organizationID from OrganizationRepresentatives where instr(lower(representativeName), ?))`;
            sqlParameters.push(representativePiece);
        }
    }
    if ((requestBody.isEligibleForLicences ?? '') !== '') {
        sql += ' and o.isEligibleForLicences = ?';
        sqlParameters.push(requestBody.isEligibleForLicences ?? '');
    }
    if ((requestBody.organizationIsActive ?? '') !== '') {
        const currentDate = dateTimeFns.dateToInteger(new Date());
        sql += ` and o.organizationID in (
      select lx.organizationID from LotteryLicences lx where lx.recordDelete_timeMillis is null and lx.issueDate is not null and lx.endDate >= ?)`;
        sqlParameters.push(currentDate);
    }
    sql += ` group by o.organizationID, o.organizationName,
      o.isEligibleForLicences, o.organizationNote, r.representativeName,
      o.recordCreate_userName, o.recordCreate_timeMillis, o.recordUpdate_userName, o.recordUpdate_timeMillis
      order by o.organizationName, o.organizationID`;
    if (includeOptions.limit !== -1) {
        sql += ` limit ${includeOptions.limit.toString()} offset ${(includeOptions.offset ?? 0).toString()}`;
    }
    const rows = database.prepare(sql).all(sqlParameters);
    database.close();
    for (const element of rows) {
        element.recordType = 'organization';
        element.licences_endDateMaxString = dateTimeFns.dateIntegerToString(element.licences_endDateMax ?? 0);
        element.canUpdate = canUpdateObject(element, requestUser);
        delete element.recordCreate_userName;
        delete element.recordCreate_timeMillis;
        delete element.recordUpdate_userName;
        delete element.recordUpdate_timeMillis;
    }
    return rows;
}
