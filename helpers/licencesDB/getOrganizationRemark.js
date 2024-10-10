import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
import { canUpdateObject } from '../licencesDB.js';
export default function getOrganizationRemark(organizationID, remarkIndex, requestUser) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const remark = database
        .prepare(`select remarkDate, remarkTime,
        remark, isImportant,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis
        from OrganizationRemarks
        where recordDelete_timeMillis is null
        and organizationID = ? and remarkIndex = ?`)
        .get(organizationID, remarkIndex);
    database.close();
    if (remark !== undefined) {
        remark.recordType = 'remark';
        remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate || 0);
        remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime || 0);
        remark.canUpdate = canUpdateObject(remark, requestUser);
    }
    return remark;
}
