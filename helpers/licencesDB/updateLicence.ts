import sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as configFns from "../configFns.js";

import { getLicenceWithDB } from "./getLicence.js";
import { addLicenceAmendmentWithDB } from "./addLicenceAmendment.js";
import { createEventWithDB } from "./createEvent.js";

import { deleteLicenceTicketTypeWithDB } from "./deleteLicenceTicketType.js";
import { addLicenceTicketTypeWithDB } from "./addLicenceTicketType.js";
import { updateLicenceTicketTypeWithDB } from "./updateLicenceTicketType.js";

import { resetLicenceTableStats, resetEventTableStats } from "../licencesDB.js";

import type * as expressSession from "express-session";


export const parseTicketTypeKey = (unparsedTicketTypeKey: string) => {

  const eventDateString = unparsedTicketTypeKey.substring(0, 10);

  return {
    eventDate: dateTimeFns.dateStringToInteger(eventDateString),
    eventDateString,
    ticketType: unparsedTicketTypeKey.substring(11)
  };
};


export interface LotteryLicenceForm {
  licenceID?: string;
  externalLicenceNumber: string;
  applicationDateString: string;
  organizationID: string;
  municipality: string;
  locationID: string;
  startDateString: string;
  endDateString: string;
  startTimeString: string;
  endTimeString: string;
  licenceDetails: string;
  termsConditions: string;
  licenceTypeKey: string;
  totalPrizeValue: string;

  ticketType_eventDateString: string | string[];
  ticketType_ticketType: string | string[];
  ticketType_unitCount: string | string[];
  ticketType_licenceFee: string | string[];
  ticketType_manufacturerLocationID: string | string[];
  ticketType_distributorLocationID: string | string[];

  ticketTypeKey_toAdd?: string | string[];
  ticketTypeKey_toDelete?: string | string[];

  eventDateString: string | string[];
  fieldKeys: string;
  licenceFee?: string;
};


export const updateLicence = (reqBody: LotteryLicenceForm, reqSession: expressSession.Session): boolean => {

  // Check if can update

  const db = sqlite(dbPath);

  const pastLicenceObj = getLicenceWithDB(db, reqBody.licenceID, reqSession, {
    includeTicketTypes: true,
    includeFields: true,
    includeEvents: true,
    includeAmendments: false,
    includeTransactions: true
  });

  if (!pastLicenceObj.canUpdate) {

    db.close();
    return false;

  }

  const nowMillis = Date.now();

  // Get integer version of external licence number for indexing

  let externalLicenceNumberInteger = -1;

  try {

    externalLicenceNumberInteger = parseInt(reqBody.externalLicenceNumber, 10);

  } catch (e) {

    externalLicenceNumberInteger = -1;

  }

  // Update licence

  const startDate_now = dateTimeFns.dateStringToInteger(reqBody.startDateString);
  const endDate_now = dateTimeFns.dateStringToInteger(reqBody.endDateString);
  const startTime_now = dateTimeFns.timeStringToInteger(reqBody.startTimeString);
  const endTime_now = dateTimeFns.timeStringToInteger(reqBody.endTimeString);

  const info = db.prepare("update LotteryLicences" +
    " set organizationID = ?," +
    " applicationDate = ?," +
    " licenceTypeKey = ?," +
    " startDate = ?," +
    " endDate = ?," +
    " startTime = ?," +
    " endTime = ?," +
    " locationID = ?," +
    " municipality = ?," +
    " licenceDetails = ?," +
    " termsConditions = ?," +
    " totalPrizeValue = ?," +
    " licenceFee = ?," +
    " externalLicenceNumber = ?," +
    " externalLicenceNumberInteger = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where licenceID = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      reqBody.organizationID,
      dateTimeFns.dateStringToInteger(reqBody.applicationDateString),
      reqBody.licenceTypeKey,
      startDate_now,
      endDate_now,
      startTime_now,
      endTime_now,
      (reqBody.locationID === "" ? null : reqBody.locationID),
      reqBody.municipality,
      reqBody.licenceDetails,
      reqBody.termsConditions,
      reqBody.totalPrizeValue,
      reqBody.licenceFee,
      reqBody.externalLicenceNumber,
      externalLicenceNumberInteger,
      reqSession.user.userName,
      nowMillis,
      reqBody.licenceID
    );

  const changeCount = info.changes;

  if (!changeCount) {

    db.close();
    return false;
  }

  // Record amendments (if necessary)

  if (pastLicenceObj.trackUpdatesAsAmendments) {

    if (configFns.getProperty("amendments.trackDateTimeUpdate") &&
      (pastLicenceObj.startDate !== startDate_now ||
        pastLicenceObj.endDate !== endDate_now ||
        pastLicenceObj.startTime !== startTime_now ||
        pastLicenceObj.endTime !== endTime_now)) {

      const amendment = (
        (pastLicenceObj.startDate !== startDate_now
          ? `Start Date: ${pastLicenceObj.startDate.toString()} -> ${startDate_now.toString()}` + "\n"
          : "") +
        (pastLicenceObj.endDate !== endDate_now
          ? `End Date: ${pastLicenceObj.endDate.toString()} -> ${endDate_now.toString()}` + "\n"
          : "") +
        (pastLicenceObj.startTime !== startTime_now
          ? `Start Time: ${pastLicenceObj.startTime.toString()} -> ${startTime_now.toString()}` + "\n"
          : "") +
        (pastLicenceObj.endTime !== endTime_now
          ? `End Time: ${pastLicenceObj.endTime.toString()} -> ${endTime_now.toString()}` + "\n"
          : "")).trim();

      addLicenceAmendmentWithDB(
        db,
        reqBody.licenceID,
        "Date Update",
        amendment,
        0,
        reqSession
      );
    }

    if (pastLicenceObj.organizationID !== parseInt(reqBody.organizationID, 10) &&
      configFns.getProperty("amendments.trackOrganizationUpdate")) {

      addLicenceAmendmentWithDB(
        db,
        reqBody.licenceID,
        "Organization Change",
        "",
        0,
        reqSession
      );
    }

    if (pastLicenceObj.locationID !== parseInt(reqBody.locationID, 10) &&
      configFns.getProperty("amendments.trackLocationUpdate")) {

      addLicenceAmendmentWithDB(
        db,
        reqBody.licenceID,
        "Location Change",
        "",
        0,
        reqSession
      );

    }

    if (pastLicenceObj.licenceFee !== parseFloat(reqBody.licenceFee) &&
      configFns.getProperty("amendments.trackLicenceFeeUpdate")) {

      addLicenceAmendmentWithDB(
        db,
        reqBody.licenceID,
        "Licence Fee Change",
        "$" + pastLicenceObj.licenceFee.toFixed(2) + " -> $" + parseFloat(reqBody.licenceFee).toFixed(2),
        0,
        reqSession
      );
    }
  }

  /*
   * Fields
   */

  db.prepare("delete from LotteryLicenceFields" +
    " where licenceID = ?")
    .run(reqBody.licenceID);

  const fieldKeys = reqBody.fieldKeys.substring(1).split(",");

  for (const fieldKey of fieldKeys) {

    const fieldValue = reqBody[fieldKey];

    if (fieldKey === "" || fieldValue === "") {
      continue;
    }

    db.prepare("insert into LotteryLicenceFields" +
      " (licenceID, fieldKey, fieldValue)" +
      " values (?, ?, ?)")
      .run(reqBody.licenceID, fieldKey, fieldValue);
  }

  /*
   * Events
   */

  if (typeof (reqBody.eventDateString) !== "undefined") {

    // Purge any deleted events to avoid conflicts

    db.prepare("delete from LotteryEventFields" +
      " where licenceID = ?" +
      (" and eventDate in (" +
        "select eventDate from LotteryEvents where licenceID = ? and recordDelete_timeMillis is not null" +
        ")"))
      .run(reqBody.licenceID, reqBody.licenceID);

    db.prepare("delete from LotteryEventCosts" +
      " where licenceID = ?" +
      (" and eventDate in (" +
        "select eventDate from LotteryEvents where licenceID = ? and recordDelete_timeMillis is not null" +
        ")"))
      .run(reqBody.licenceID, reqBody.licenceID);

    db.prepare("delete from LotteryEvents" +
      " where licenceID = ?" +
      " and recordDelete_timeMillis is not null")
      .run(reqBody.licenceID);

  }

  let eventDateStrings_toAdd: string[];

  if (typeof (reqBody.eventDateString) === "string") {
    eventDateStrings_toAdd = [reqBody.eventDateString];
  } else if (typeof (reqBody.eventDateString) === "object") {
    eventDateStrings_toAdd = reqBody.eventDateString;
  }

  if (eventDateStrings_toAdd) {
    for (const eventDate of eventDateStrings_toAdd) {
      createEventWithDB(db,
        reqBody.licenceID, eventDate,
        reqSession);
    }
  }

  /*
   * Ticket types
   */

  // Do deletes

  let ticketTypeKeys_toDelete: string[];

  if (typeof (reqBody.ticketTypeKey_toDelete) === "string") {
    ticketTypeKeys_toDelete = [reqBody.ticketTypeKey_toDelete];
  } else if (typeof (reqBody.ticketTypeKey_toDelete) === "object") {
    ticketTypeKeys_toDelete = reqBody.ticketTypeKey_toDelete;
  }

  if (ticketTypeKeys_toDelete) {
    ticketTypeKeys_toDelete.forEach((ticketTypeKey_toDelete: string) => {

      const parsedTicketTypeKey = parseTicketTypeKey(ticketTypeKey_toDelete);

      deleteLicenceTicketTypeWithDB(db, {
        licenceID: reqBody.licenceID,
        eventDate: parsedTicketTypeKey.eventDate,
        ticketType: parsedTicketTypeKey.ticketType
      }, reqSession);

      if (pastLicenceObj.trackUpdatesAsAmendments &&
        configFns.getProperty("amendments.trackTicketTypeDelete")) {

        addLicenceAmendmentWithDB(
          db,
          reqBody.licenceID,
          "Ticket Type Removed",
          "Removed " + ticketTypeKey_toDelete + ".",
          0,
          reqSession
        );
      }
    });
  }

  // Do adds

  let ticketTypeKeys_toAdd: string[];

  if (typeof (reqBody.ticketTypeKey_toAdd) === "string") {
    ticketTypeKeys_toAdd = [reqBody.ticketTypeKey_toAdd];
  } else if (typeof (reqBody.ticketTypeKey_toAdd) === "object") {
    ticketTypeKeys_toAdd = reqBody.ticketTypeKey_toAdd;
  }

  if (ticketTypeKeys_toAdd) {
    ticketTypeKeys_toAdd.forEach((ticketTypeKey_toAdd) => {

      const parsedTicketTypeKey = parseTicketTypeKey(ticketTypeKey_toAdd);

      addLicenceTicketTypeWithDB(db, {
        licenceID: reqBody.licenceID,
        eventDate: parsedTicketTypeKey.eventDate,
        ticketType: parsedTicketTypeKey.ticketType
      }, reqSession);

      if (pastLicenceObj.trackUpdatesAsAmendments &&
        configFns.getProperty("amendments.trackTicketTypeNew")) {

        addLicenceAmendmentWithDB(
          db,
          reqBody.licenceID,
          "New Ticket Type",
          "Added " + ticketTypeKey_toAdd + ".",
          0,
          reqSession
        );
      }
    });
  }

  // Do updates

  if (typeof (reqBody.ticketType_ticketType) === "string") {

    updateLicenceTicketTypeWithDB(db, {
      licenceID: reqBody.licenceID,
      eventDateString: reqBody.ticketType_eventDateString as string,
      ticketType: reqBody.ticketType_ticketType,
      unitCount: reqBody.ticketType_unitCount as string,
      licenceFee: reqBody.ticketType_licenceFee as string,
      distributorLocationID: reqBody.ticketType_distributorLocationID as string,
      manufacturerLocationID: reqBody.ticketType_manufacturerLocationID as string
    }, reqSession);

    if (pastLicenceObj.trackUpdatesAsAmendments) {

      const ticketTypeObj_past = pastLicenceObj.licenceTicketTypes
        .find((ele) => ele.ticketType === reqBody.ticketType_ticketType);

      if (ticketTypeObj_past &&
        configFns.getProperty("amendments.trackTicketTypeUpdate") &&
        ticketTypeObj_past.unitCount !== parseInt(reqBody.ticketType_unitCount as string, 10)) {

        addLicenceAmendmentWithDB(
          db,
          reqBody.licenceID,
          "Ticket Type Change",
          ((reqBody.ticketType_eventDateString as string) + ":" + reqBody.ticketType_ticketType + " Units: " +
            ticketTypeObj_past.unitCount.toString() + " -> " + reqBody.ticketType_unitCount.toString()),
          0,
          reqSession
        );
      }
    }

  } else if (typeof (reqBody.ticketType_ticketType) === "object") {

    reqBody.ticketType_ticketType.forEach((ticketType: string, ticketTypeIndex: number) => {

      updateLicenceTicketTypeWithDB(db, {
        licenceID: reqBody.licenceID,
        eventDateString: reqBody.ticketType_eventDateString[ticketTypeIndex],
        ticketType: reqBody.ticketType_ticketType[ticketTypeIndex],
        unitCount: reqBody.ticketType_unitCount[ticketTypeIndex],
        licenceFee: reqBody.ticketType_licenceFee[ticketTypeIndex],
        distributorLocationID: reqBody.ticketType_distributorLocationID[ticketTypeIndex],
        manufacturerLocationID: reqBody.ticketType_manufacturerLocationID[ticketTypeIndex]
      }, reqSession);

      if (pastLicenceObj.trackUpdatesAsAmendments) {

        const ticketTypeObj_past =
          pastLicenceObj.licenceTicketTypes.find((ele) => ele.ticketType === ticketType && ele.eventDateString === reqBody.ticketType_eventDateString[ticketTypeIndex]);

        if (ticketTypeObj_past &&
          configFns.getProperty("amendments.trackTicketTypeUpdate") &&
          ticketTypeObj_past.unitCount !== parseInt(reqBody.ticketType_unitCount[ticketTypeIndex], 10)) {

          addLicenceAmendmentWithDB(
            db,
            reqBody.licenceID,
            "Ticket Type Change",
            (reqBody.ticketType_eventDateString[ticketTypeIndex] + ":" + ticketType + " Units: " +
              ticketTypeObj_past.unitCount.toString() + " -> " + reqBody.ticketType_unitCount[ticketTypeIndex]),
            0,
            reqSession
          );
        }
      }
    });
  }

  db.close();

  // Reset the cached stats
  resetLicenceTableStats();
  resetEventTableStats();

  return changeCount > 0;
};
