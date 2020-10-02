import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as llm from "../../types/recordTypes";


export const getDashboardStats = () => {

  const windowDate = new Date();
  const currentDateInteger = dateTimeFns.dateToInteger(windowDate);

  windowDate.setDate(windowDate.getDate() + 7);
  const windowEndDateInteger = dateTimeFns.dateToInteger(windowDate);

  windowDate.setDate(windowDate.getDate() - 14);
  const windowStartDateInteger = dateTimeFns.dateToInteger(windowDate);


  const db = sqlite(dbPath, {
    readonly: true
  });


  const licenceStats: {
    licenceCount: number;
    distinctOrganizationCount: number;
    distinctLocationCount: number;
  } = db.prepare("select ifnull(count(licenceID), 0) as licenceCount," +
    " ifnull(count(distinct organizationID), 0) as distinctOrganizationCount," +
    " ifnull(count(distinct locationID), 0) as distinctLocationCount" +
    " from LotteryLicences" +
    " where recordDelete_timeMillis is NULL" +
    " and issueDate is not NULL" +
    " and endDate >= ?")
    .get(currentDateInteger);


  const eventStats: {
    todayCount: number;
    pastCount: number;
    upcomingCount: number;
  } = db.prepare("select ifnull(sum(case when eventDate = ? then 1 else 0 end), 0) as todayCount," +
    " ifnull(sum(case when eventDate < ? then 1 else 0 end), 0) as pastCount," +
    " ifnull(sum(case when eventDate > ? then 1 else 0 end), 0) as upcomingCount" +
    " from LotteryEvents" +
    " where recordDelete_timeMillis is NULL" +
    " and eventDate >= ?" +
    " and eventDate <= ?")
    .get(currentDateInteger, currentDateInteger, currentDateInteger,
      windowStartDateInteger, windowEndDateInteger);

  let events: llm.LotteryEvent[] = [];

  if (eventStats.todayCount > 0 || eventStats.upcomingCount > 0) {

    events = db.prepare("select e.eventDate, l.licenceID, l.externalLicenceNumber," +
      " l.licenceTypeKey," +
      " lo.locationName, lo.locationAddress1," +
      " o.organizationName" +
      " from LotteryEvents e" +
      " left join LotteryLicences l on e.licenceID = l.licenceID" +
      " left join Locations lo on l.locationID = lo.locationID" +
      " left join Organizations o on l.organizationID = o.organizationID" +
      " where e.recordDelete_timeMillis is null" +
      " and l.recordDelete_timeMillis is null" +
      " and e.eventDate >= ?" +
      " and e.eventDate <= ?" +
      " order by e.eventDate, l.startTime")
      .all(currentDateInteger, windowEndDateInteger);

    for (const eventRecord of events) {

      eventRecord.eventDateString = dateTimeFns.dateIntegerToString(eventRecord.eventDate);

      eventRecord.locationDisplayName =
        (eventRecord.locationName === "" ? eventRecord.locationAddress1 : eventRecord.locationName);

    }
  }

  const reminderStats: {
    todayCount: number;
    pastCount: number;
    upcomingCount: number;
  } = db.prepare("select ifnull(sum(case when reminderDate = ? then 1 else 0 end), 0) as todayCount," +
    " ifnull(sum(case when reminderDate < ? then 1 else 0 end), 0) as pastCount," +
    " ifnull(sum(case when reminderDate > ? then 1 else 0 end), 0) as upcomingCount" +
    " from OrganizationReminders" +
    " where recordDelete_timeMillis is NULL" +
    " and dismissedDate is null" +
    " and reminderDate <= ?")
    .get(currentDateInteger, currentDateInteger, currentDateInteger,
      windowEndDateInteger);

  let reminders: llm.OrganizationReminder[] = [];

  if (reminderStats.todayCount > 0 || reminderStats.upcomingCount > 0) {

    reminders = db.prepare("select r.organizationID, o.organizationName," +
      " r.reminderTypeKey, r.reminderDate" +
      " from OrganizationReminders r" +
      " left join Organizations o on r.organizationID = o.organizationID" +
      " where r.recordDelete_timeMillis is null" +
      " and o.recordDelete_timeMillis is null" +
      " and r.dismissedDate is null" +
      " and r.reminderDate >= ?" +
      " and r.reminderDate <= ?" +
      " order by r.reminderDate, o.organizationName, r.reminderTypeKey")
      .all(currentDateInteger, windowEndDateInteger);

    for (const reminder of reminders) {
      reminder.reminderDateString = dateTimeFns.dateIntegerToString(reminder.reminderDate);
    }
  }


  db.close();


  const result = {
    currentDate: currentDateInteger,
    currentDateString: dateTimeFns.dateIntegerToString(currentDateInteger),

    windowStartDate: windowStartDateInteger,
    windowStartDateString: dateTimeFns.dateIntegerToString(windowStartDateInteger),

    windowEndDate: windowEndDateInteger,
    windowEndDateString: dateTimeFns.dateIntegerToString(windowEndDateInteger),

    licenceStats,
    eventStats,
    events,
    reminderStats,
    reminders
  };

  return result;

};