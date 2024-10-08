import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
export default function getDistinctTermsConditions(organizationID) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const terms = database
        .prepare(`select termsConditions,
        count(licenceID) as termsConditionsCount,
        max(case when l.issueDate is null then 0 else 1 end) as isIssued,
        max(startDate) as startDateMax
        from LotteryLicences l
        where l.organizationID = ?
        and l.termsConditions is not null
        and trim(l.termsConditions) <> ''
        and l.recordDelete_timeMillis is null
        group by l.termsConditions
        order by startDateMax desc`)
        .all(organizationID);
    database.close();
    for (const term of terms) {
        term.startDateMaxString = dateTimeFns.dateIntegerToString(term.startDateMax);
    }
    return terms;
}
