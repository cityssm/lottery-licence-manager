import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../licencesDB.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const getEvents = (requestBody: {
  externalLicenceNumber?: string;
  licenceTypeKey?: string;
  organizationName?: string;
  locationName?: string;
  eventYear?: string;
}, requestSession: expressSession.Session): llm.LotteryEvent[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const sqlParameters = [requestBody.eventYear, requestBody.eventYear];

  let sql = "select e.eventDate, e.bank_name," +
    " sum(coalesce(c.costs_receipts, 0)) as costs_receiptsSum," +
    " l.licenceID, l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails," +
    " lo.locationName, lo.locationAddress1," +
    " l.startTime, l.endTime," +
    " o.organizationName," +
    " e.recordCreate_userName, e.recordCreate_timeMillis, e.recordUpdate_userName, e.recordUpdate_timeMillis" +
    " from LotteryEvents e" +
    " left join LotteryLicences l on e.licenceID = l.licenceID" +
    " left join Locations lo on l.locationID = lo.locationID" +
    " left join Organizations o on l.organizationID = o.organizationID" +
    " left join LotteryEventCosts c on e.licenceID = c.licenceID and e.eventDate = c.eventDate" +
    " where e.recordDelete_timeMillis is null" +
    " and l.recordDelete_timeMillis is null" +
    " and e.eventDate > (? * 10000)" +
    " and e.eventDate < (? * 10000) + 9999";

  if (requestBody.externalLicenceNumber && requestBody.externalLicenceNumber !== "") {
    sql += " and instr(lower(l.externalLicenceNumber), ?) > 0";
    sqlParameters.push(requestBody.externalLicenceNumber);
  }

  if (requestBody.licenceTypeKey && requestBody.licenceTypeKey !== "") {
    sql += " and l.licenceTypeKey = ?";
    sqlParameters.push(requestBody.licenceTypeKey);
  }

  if (requestBody.organizationName && requestBody.organizationName !== "") {

    const organizationNamePieces = requestBody.organizationName.toLowerCase().split(" ");

    for (const organizationNamePiece of organizationNamePieces) {
      sql += " and instr(lower(o.organizationName), ?)";
      sqlParameters.push(organizationNamePiece);
    }
  }

  if (requestBody.locationName && requestBody.locationName !== "") {

    const locationNamePieces = requestBody.locationName.toLowerCase().split(" ");

    for (const locationNamePiece of locationNamePieces) {
      sql += " and (instr(lower(lo.locationName), ?) or instr(lower(lo.locationAddress1), ?))";

      sqlParameters.push(locationNamePiece, locationNamePiece);
    }
  }

  sql += " group by e.eventDate, e.bank_name," +
    " l.licenceID, l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails," +
    " lo.locationName, lo.locationAddress1, l.startTime, l.endTime, o.organizationName," +
    " e.recordCreate_userName, e.recordCreate_timeMillis, e.recordUpdate_userName, e.recordUpdate_timeMillis" +
    " order by e.eventDate, l.startTime";

  const events: llm.LotteryEvent[] =
    database.prepare(sql)
      .all(sqlParameters);

  database.close();

  for (const lotteryEvent of events) {

    lotteryEvent.recordType = "event";

    lotteryEvent.eventDateString = dateTimeFns.dateIntegerToString(lotteryEvent.eventDate);

    lotteryEvent.startTimeString = dateTimeFns.timeIntegerToString(lotteryEvent.startTime || 0);
    lotteryEvent.endTimeString = dateTimeFns.timeIntegerToString(lotteryEvent.endTime || 0);

    lotteryEvent.locationDisplayName =
      (lotteryEvent.locationName === "" ? lotteryEvent.locationAddress1 : lotteryEvent.locationName);

    lotteryEvent.canUpdate = canUpdateObject(lotteryEvent, requestSession);

    delete lotteryEvent.locationName;
    delete lotteryEvent.locationAddress1;
    delete lotteryEvent.bank_name;
  }

  return events;
};
