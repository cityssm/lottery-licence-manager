import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
export default function getEventFinancialSummary(requestBody) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const sqlParameters = [];
    let sql = `select licenceTypeKey,
      count(licenceID) as licenceCount,
      sum(eventCount) as eventCount,
      sum(reportDateCount) as reportDateCount,
      sum(ifnull(licenceFee, 0)) as licenceFeeSum,
      sum(costs_receiptsSum) as costs_receiptsSum,
      sum(costs_adminSum) as costs_adminSum,
      sum(costs_prizesAwardedSum) as costs_prizesAwardedSum,
      sum(costs_receiptsSum - costs_adminSum - costs_prizesAwardedSum) as costs_netProceedsSum,
      sum(costs_amountDonatedSum) as costs_amountDonatedSum
      from (
        select l.licenceID, l.licenceTypeKey, l.licenceFee,
        count(*) as eventCount,
        sum(case when (e.reportDate is null or e.reportDate = 0) then 0 else 1 end) as reportDateCount,
        sum(ifnull(c.costs_receiptsSum, 0)) as costs_receiptsSum,
        sum(ifnull(c.costs_adminSum,0)) as costs_adminSum,
        sum(ifnull(c.costs_prizesAwardedSum,0)) as costs_prizesAwardedSum,
        sum(ifnull(e.costs_amountDonated,0)) as costs_amountDonatedSum
        from LotteryLicences l
        left join LotteryEvents e on l.licenceID = e.licenceID and e.recordDelete_timeMillis is null
        left join (
          select licenceID, eventDate,
          sum(ifnull(costs_receipts, 0)) as costs_receiptsSum,
          sum(ifnull(costs_admin, 0)) as costs_adminSum,
          sum(ifnull(costs_prizesAwarded, 0)) as costs_prizesAwardedSum
          from LotteryEventCosts
          group by licenceID, eventDate
        ) c on e.licenceID = c.licenceID and e.eventDate = c.eventDate
        where l.recordDelete_timeMillis is null`;
    if (requestBody.eventDateStartString &&
        requestBody.eventDateStartString !== '') {
        sql += ' and e.eventDate >= ?';
        sqlParameters.push(dateTimeFns.dateStringToInteger(requestBody.eventDateStartString));
    }
    if (requestBody.eventDateEndString && requestBody.eventDateEndString !== '') {
        sql += ' and e.eventDate <= ?';
        sqlParameters.push(dateTimeFns.dateStringToInteger(requestBody.eventDateEndString));
    }
    sql += ` group by l.licenceID, l.licenceTypeKey, l.licenceFee
    ) t
    group by licenceTypeKey`;
    const rows = database
        .prepare(sql)
        .all(sqlParameters);
    database.close();
    return rows;
}
