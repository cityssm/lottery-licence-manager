import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import { canUpdateObject } from "../licencesDB";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const getEvent = (licenceID: number, eventDate: number, reqSession: expressSession.Session) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const eventObj: llm.LotteryEvent = db.prepare("select *" +
    " from LotteryEvents" +
    " where recordDelete_timeMillis is null" +
    " and licenceID = ?" +
    " and eventDate = ?")
    .get(licenceID, eventDate);

  if (eventObj) {

    eventObj.recordType = "event";

    eventObj.eventDateString = dateTimeFns.dateIntegerToString(eventObj.eventDate);

    eventObj.reportDateString = dateTimeFns.dateIntegerToString(eventObj.reportDate);

    eventObj.startTimeString = dateTimeFns.timeIntegerToString(eventObj.startTime || 0);
    eventObj.endTimeString = dateTimeFns.timeIntegerToString(eventObj.endTime || 0);

    eventObj.costs_netProceeds = (eventObj.costs_receipts || 0) -
      (eventObj.costs_admin || 0) -
      (eventObj.costs_prizesAwarded || 0);

    eventObj.canUpdate = canUpdateObject(eventObj, reqSession);

    const rows = db.prepare("select fieldKey, fieldValue" +
      " from LotteryEventFields" +
      " where licenceID = ? and eventDate = ?")
      .all(licenceID, eventDate);

    eventObj.eventFields = rows || [];
  }

  db.close();

  return eventObj;
};
