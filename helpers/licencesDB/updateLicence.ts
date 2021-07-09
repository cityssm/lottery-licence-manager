import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as configFunctions from "../functions.config.js";

import { getLicenceWithDB } from "./getLicence.js";
import { addLicenceAmendmentWithDB } from "./addLicenceAmendment.js";
import { createEventWithDB } from "./createEvent.js";

import { deleteLicenceTicketTypeWithDB } from "./deleteLicenceTicketType.js";
import { getMaxLicenceTicketTypeIndexWithDB } from "./getMaxLicenceTicketTypeIndex.js";
import { addLicenceTicketTypeWithDB } from "./addLicenceTicketType.js";

import { resetLicenceTableStats, resetEventTableStats } from "../licencesDB.js";

import type * as expressSession from "express-session";


interface ParseTicketTypeKeyReturn {
  eventDate: number;
  eventDateString: string;
  ticketType: string;
}


export const parseTicketTypeKey = (unparsedTicketTypeKey: string): ParseTicketTypeKeyReturn => {

  const eventDateString = unparsedTicketTypeKey.slice(0, 10);

  return {
    eventDate: dateTimeFns.dateStringToInteger(eventDateString),
    eventDateString,
    ticketType: unparsedTicketTypeKey.slice(11)
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

  ticketType_amendmentDateString: string | string[];
  ticketType_ticketType: string | string[];
  ticketType_unitCount: string | string[];
  ticketType_licenceFee: string | string[];
  ticketType_manufacturerLocationID: string | string[];
  ticketType_distributorLocationID: string | string[];

  ticketTypeIndex_toDelete?: string | string[];

  eventDateString: string | string[];
  fieldKeys: string;
  licenceFee?: string;
}


export const updateLicence = (requestBody: LotteryLicenceForm, requestSession: expressSession.Session): boolean => {

  // Check if can update

  const database = sqlite(databasePath);

  const pastLicenceObject = getLicenceWithDB(database, requestBody.licenceID, requestSession, {
    includeTicketTypes: true,
    includeFields: true,
    includeEvents: true,
    includeAmendments: false,
    includeTransactions: true
  });

  if (!pastLicenceObject.canUpdate) {

    database.close();
    return false;

  }

  const nowDate = new Date();
  const nowDateInt = dateTimeFns.dateToInteger(nowDate);
  const nowMillis = nowDate.getTime();

  // Get integer version of external licence number for indexing

  let externalLicenceNumberInteger = Number.parseInt(requestBody.externalLicenceNumber, 10);

  if (Number.isNaN(externalLicenceNumberInteger)) {
    externalLicenceNumberInteger = -1;
  }

  // Update licence

  const startDate_now = dateTimeFns.dateStringToInteger(requestBody.startDateString);
  const endDate_now = dateTimeFns.dateStringToInteger(requestBody.endDateString);
  const startTime_now = dateTimeFns.timeStringToInteger(requestBody.startTimeString);
  const endTime_now = dateTimeFns.timeStringToInteger(requestBody.endTimeString);

  const changeCount = database.prepare("update LotteryLicences" +
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
      requestBody.organizationID,
      dateTimeFns.dateStringToInteger(requestBody.applicationDateString),
      requestBody.licenceTypeKey,
      startDate_now,
      endDate_now,
      startTime_now,
      endTime_now,
      (requestBody.locationID === "" ? undefined : requestBody.locationID),
      requestBody.municipality,
      requestBody.licenceDetails,
      requestBody.termsConditions,
      requestBody.totalPrizeValue,
      requestBody.licenceFee,
      requestBody.externalLicenceNumber,
      externalLicenceNumberInteger,
      requestSession.user.userName,
      nowMillis,
      requestBody.licenceID
    ).changes;

  if (!changeCount) {
    database.close();
    return false;
  }

  // Record amendments (if necessary)

  if (pastLicenceObject.trackUpdatesAsAmendments) {

    if (configFunctions.getProperty("amendments.trackDateTimeUpdate") &&
      (pastLicenceObject.startDate !== startDate_now ||
        pastLicenceObject.endDate !== endDate_now ||
        pastLicenceObject.startTime !== startTime_now ||
        pastLicenceObject.endTime !== endTime_now)) {

      const amendment = (
        (pastLicenceObject.startDate !== startDate_now
          ? `Start Date: ${pastLicenceObject.startDate.toString()} -> ${startDate_now.toString()}` + "\n"
          : "") +
        (pastLicenceObject.endDate !== endDate_now
          ? `End Date: ${pastLicenceObject.endDate.toString()} -> ${endDate_now.toString()}` + "\n"
          : "") +
        (pastLicenceObject.startTime !== startTime_now
          ? `Start Time: ${pastLicenceObject.startTime.toString()} -> ${startTime_now.toString()}` + "\n"
          : "") +
        (pastLicenceObject.endTime !== endTime_now
          ? `End Time: ${pastLicenceObject.endTime.toString()} -> ${endTime_now.toString()}` + "\n"
          : "")).trim();

      addLicenceAmendmentWithDB(
        database,
        requestBody.licenceID,
        "Date Update",
        amendment,
        0,
        requestSession
      );
    }

    if (pastLicenceObject.organizationID !== Number.parseInt(requestBody.organizationID, 10) &&
      configFunctions.getProperty("amendments.trackOrganizationUpdate")) {

      addLicenceAmendmentWithDB(
        database,
        requestBody.licenceID,
        "Organization Change",
        "",
        0,
        requestSession
      );
    }

    if (pastLicenceObject.locationID !== Number.parseInt(requestBody.locationID, 10) &&
      configFunctions.getProperty("amendments.trackLocationUpdate")) {

      addLicenceAmendmentWithDB(
        database,
        requestBody.licenceID,
        "Location Change",
        "",
        0,
        requestSession
      );

    }

    if (pastLicenceObject.licenceFee !== Number.parseFloat(requestBody.licenceFee) &&
      configFunctions.getProperty("amendments.trackLicenceFeeUpdate")) {

      addLicenceAmendmentWithDB(
        database,
        requestBody.licenceID,
        "Licence Fee Change",
        "$" + pastLicenceObject.licenceFee.toFixed(2) + " -> $" + Number.parseFloat(requestBody.licenceFee).toFixed(2),
        0,
        requestSession
      );
    }
  }

  /*
   * Fields
   */

  database.prepare("delete from LotteryLicenceFields" +
    " where licenceID = ?")
    .run(requestBody.licenceID);

  const fieldKeys = requestBody.fieldKeys.slice(1).split(",");

  for (const fieldKey of fieldKeys) {

    const fieldValue = requestBody[fieldKey];

    if (fieldKey === "" || fieldValue === "") {
      continue;
    }

    database.prepare("insert into LotteryLicenceFields" +
      " (licenceID, fieldKey, fieldValue)" +
      " values (?, ?, ?)")
      .run(requestBody.licenceID, fieldKey, fieldValue);
  }

  /*
   * Events
   */

  if (typeof (requestBody.eventDateString) !== "undefined") {

    // Purge any deleted events to avoid conflicts

    database.prepare("delete from LotteryEventFields" +
      " where licenceID = ?" +
      (" and eventDate in (" +
        "select eventDate from LotteryEvents where licenceID = ? and recordDelete_timeMillis is not null" +
        ")"))
      .run(requestBody.licenceID, requestBody.licenceID);

    database.prepare("delete from LotteryEventCosts" +
      " where licenceID = ?" +
      (" and eventDate in (" +
        "select eventDate from LotteryEvents where licenceID = ? and recordDelete_timeMillis is not null" +
        ")"))
      .run(requestBody.licenceID, requestBody.licenceID);

    database.prepare("delete from LotteryEvents" +
      " where licenceID = ?" +
      " and recordDelete_timeMillis is not null")
      .run(requestBody.licenceID);

  }

  let eventDateStrings_toAdd: string[];

  if (typeof (requestBody.eventDateString) === "string") {
    eventDateStrings_toAdd = [requestBody.eventDateString];
  } else if (typeof (requestBody.eventDateString) === "object") {
    eventDateStrings_toAdd = requestBody.eventDateString;
  }

  if (eventDateStrings_toAdd) {
    for (const eventDate of eventDateStrings_toAdd) {
      createEventWithDB(database,
        requestBody.licenceID, eventDate,
        requestSession);
    }
  }

  /*
   * Ticket types
   */

  // Do deletes

  let ticketTypeIndexes_toDelete: string[];

  if (typeof (requestBody.ticketTypeIndex_toDelete) === "string") {
    ticketTypeIndexes_toDelete = [requestBody.ticketTypeIndex_toDelete];
  } else if (typeof (requestBody.ticketTypeIndex_toDelete) === "object") {
    ticketTypeIndexes_toDelete = requestBody.ticketTypeIndex_toDelete;
  }

  if (ticketTypeIndexes_toDelete) {
    for (const ticketTypeIndex_toDelete of ticketTypeIndexes_toDelete) {

      deleteLicenceTicketTypeWithDB(database, {
        licenceID: requestBody.licenceID,
        ticketTypeIndex: ticketTypeIndex_toDelete
      }, requestSession);

      if (pastLicenceObject.trackUpdatesAsAmendments &&
        configFunctions.getProperty("amendments.trackTicketTypeDelete")) {

        addLicenceAmendmentWithDB(
          database,
          requestBody.licenceID,
          "Ticket Type Removed",
          "Removed " + ticketTypeIndex_toDelete + ".",
          0,
          requestSession
        );
      }
    }
  }

  // Do adds

  if (typeof (requestBody.ticketType_ticketType) === "string") {

    const newTicketTypeIndex = getMaxLicenceTicketTypeIndexWithDB(database, requestBody.licenceID) + 1;

    addLicenceTicketTypeWithDB(database, {
      licenceID: requestBody.licenceID,
      ticketTypeIndex: newTicketTypeIndex,
      amendmentDate: nowDateInt,
      ticketType: requestBody.ticketType_ticketType,
      unitCount: (requestBody.ticketType_unitCount as string),
      licenceFee: (requestBody.ticketType_licenceFee as string),
      distributorLocationID: (requestBody.ticketType_distributorLocationID as string),
      manufacturerLocationID: (requestBody.ticketType_manufacturerLocationID as string)
    }, requestSession);

    if (pastLicenceObject.trackUpdatesAsAmendments &&
      configFunctions.getProperty("amendments.trackTicketTypeNew")) {

      addLicenceAmendmentWithDB(
        database,
        requestBody.licenceID,
        "Added Ticket Type",
        requestBody.ticketType_ticketType,
        0,
        requestSession
      );
    }

  } else if (typeof (requestBody.ticketType_ticketType) === "object") {

    const newTicketTypeIndex = getMaxLicenceTicketTypeIndexWithDB(database, requestBody.licenceID) + 1;

    for (const [ticketTypeIndex, ticketType] of requestBody.ticketType_ticketType) {

      addLicenceTicketTypeWithDB(database, {
        licenceID: requestBody.licenceID,
        ticketTypeIndex: newTicketTypeIndex + ticketTypeIndex,
        amendmentDate: nowDateInt,
        ticketType,
        unitCount: requestBody.ticketType_unitCount[ticketTypeIndex],
        licenceFee: requestBody.ticketType_licenceFee[ticketTypeIndex],
        distributorLocationID: requestBody.ticketType_distributorLocationID[ticketTypeIndex],
        manufacturerLocationID: requestBody.ticketType_manufacturerLocationID[ticketTypeIndex]
      }, requestSession);

      if (pastLicenceObject.trackUpdatesAsAmendments &&
        configFunctions.getProperty("amendments.trackTicketTypeNew")) {

        addLicenceAmendmentWithDB(
          database,
          requestBody.licenceID,
          "Added Ticket Type",
          ticketType,
          0,
          requestSession
        );
      }
    }
  }

  database.close();

  // Reset the cached stats
  resetLicenceTableStats();
  resetEventTableStats();

  return changeCount > 0;
};


export default updateLicence;
