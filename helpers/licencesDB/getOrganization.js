import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
import { canUpdateObject } from '../licencesDB.js';
export default function getOrganization(organizationID, requestUser) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const organizationObject = database
        .prepare('select * from Organizations where organizationID = ?')
        .get(organizationID);
    if (organizationObject) {
        organizationObject.recordType = 'organization';
        organizationObject.fiscalStartDateString = dateTimeFns.dateIntegerToString(organizationObject.fiscalStartDate);
        organizationObject.fiscalEndDateString = dateTimeFns.dateIntegerToString(organizationObject.fiscalEndDate);
        organizationObject.canUpdate = canUpdateObject(organizationObject, requestUser);
        const representativesList = database
            .prepare('select * from OrganizationRepresentatives' +
            ' where organizationID = ?' +
            ' order by isDefault desc, representativeName')
            .all(organizationID);
        organizationObject.organizationRepresentatives = representativesList;
    }
    database.close();
    return organizationObject;
}
