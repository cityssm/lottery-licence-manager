import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
export function createEventWithDB(database, licenceID, eventDateString, requestUser) {
    const nowMillis = Date.now();
    database
        .prepare(`insert or ignore into LotteryEvents (
        licenceID, eventDate,
        recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?)`)
        .run(licenceID, dateTimeFns.dateStringToInteger(eventDateString), requestUser.userName, nowMillis, requestUser.userName, nowMillis);
}
