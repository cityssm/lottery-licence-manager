import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { licencesDB as databasePath } from '../../data/databasePaths.js';
export default function getPastEventBankingInformation(licenceID) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const organizationIDResult = database
        .prepare('select organizationID from LotteryLicences' + ' where licenceID = ?')
        .get(licenceID);
    if (!organizationIDResult) {
        return [];
    }
    const organizationID = organizationIDResult.organizationID;
    const cutoffDateInteger = dateTimeFns.dateToInteger(new Date()) - 50_000;
    const bankInfoList = database
        .prepare(`select bank_name, bank_address, bank_accountNumber,
        max(eventDate) as eventDateMax
        from LotteryEvents
        where licenceID in (
          select licenceID from LotteryLicences where organizationID = ? and recordDelete_timeMillis is null
        )
        and licenceID <> ?
        and eventDate >= ?
        and recordDelete_timeMillis is null
        and bank_name is not null and bank_name <> ''
        and bank_address is not null and bank_address <> ''
        and bank_accountNumber is not null and bank_accountNumber <> ''
        group by bank_name, bank_address, bank_accountNumber
        order by max(eventDate) desc`)
        .all(organizationID, licenceID, cutoffDateInteger);
    database.close();
    for (const record of bankInfoList) {
        record.eventDateMaxString = dateTimeFns.dateIntegerToString(record.eventDateMax);
    }
    return bankInfoList;
}
