import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import { canUpdateObject } from "../licencesDB";

import type * as llm from "../../types/recordTypes";


export const getLicences = (reqBodyOrParamsObj: {
  externalLicenceNumber?: string;
  licenceTypeKey?: string;
  organizationID?: string | number;
  organizationName?: string;
  licenceStatus?: string;
  locationID?: number;
  locationName?: string;
},
  reqSession: Express.SessionData,
  includeOptions: {
    includeOrganization: boolean;
    limit: number;
    offset: number;
  }) => {

  if (reqBodyOrParamsObj.organizationName && reqBodyOrParamsObj.organizationName !== "") {
    includeOptions.includeOrganization = true;
  }

  const db = sqlite(dbPath, {
    readonly: true
  });

  // build where clause

  const sqlParams = [];

  let sqlWhereClause = " where l.recordDelete_timeMillis is null";

  if (reqBodyOrParamsObj.externalLicenceNumber && reqBodyOrParamsObj.externalLicenceNumber !== "") {

    const externalLicenceNumberPieces = reqBodyOrParamsObj.externalLicenceNumber.toLowerCase().split(" ");

    for (const externalLicenceNumberPiece of externalLicenceNumberPieces) {

      sqlWhereClause += " and instr(lower(l.externalLicenceNumber), ?)";
      sqlParams.push(externalLicenceNumberPiece);
    }
  }

  if (reqBodyOrParamsObj.organizationID && reqBodyOrParamsObj.organizationID !== "") {

    sqlWhereClause += " and l.organizationID = ?";
    sqlParams.push(reqBodyOrParamsObj.organizationID);

  }

  if (reqBodyOrParamsObj.organizationName && reqBodyOrParamsObj.organizationName !== "") {

    const organizationNamePieces = reqBodyOrParamsObj.organizationName.toLowerCase().split(" ");

    for (const organizationNamePiece of organizationNamePieces) {
      sqlWhereClause += " and instr(lower(o.organizationName), ?)";
      sqlParams.push(organizationNamePiece);
    }
  }

  if (reqBodyOrParamsObj.licenceTypeKey && reqBodyOrParamsObj.licenceTypeKey !== "") {

    sqlWhereClause += " and l.licenceTypeKey = ?";
    sqlParams.push(reqBodyOrParamsObj.licenceTypeKey);
  }

  if (reqBodyOrParamsObj.licenceStatus) {

    if (reqBodyOrParamsObj.licenceStatus === "past") {

      sqlWhereClause += " and l.endDate < ?";
      sqlParams.push(dateTimeFns.dateToInteger(new Date()));

    } else if (reqBodyOrParamsObj.licenceStatus === "active") {

      sqlWhereClause += " and l.endDate >= ?";
      sqlParams.push(dateTimeFns.dateToInteger(new Date()));
    }
  }

  if (reqBodyOrParamsObj.locationID) {

    sqlWhereClause += " and (l.locationID = ?" +
      " or l.licenceID in (" +
      "select licenceID from LotteryLicenceTicketTypes" +
      " where recordDelete_timeMillis is null and (distributorLocationID = ? or manufacturerLocationID = ?)" +
      ")" +
      ")";

    sqlParams.push(reqBodyOrParamsObj.locationID);
    sqlParams.push(reqBodyOrParamsObj.locationID);
    sqlParams.push(reqBodyOrParamsObj.locationID);
  }

  if (reqBodyOrParamsObj.locationName && reqBodyOrParamsObj.locationName !== "") {

    const locationNamePieces = reqBodyOrParamsObj.locationName.toLowerCase().split(" ");

    for (const locationNamePiece of locationNamePieces) {
      sqlWhereClause += " and (instr(lower(lo.locationName), ?) or instr(lower(lo.locationAddress1), ?))";
      sqlParams.push(locationNamePiece);
      sqlParams.push(locationNamePiece);
    }
  }

  // if a limit is used, get the count

  let count = 0;

  if (includeOptions.limit !== -1) {

    count = db.prepare("select ifnull(count(*), 0) as cnt" +
      " from LotteryLicences l" +
      " left join Organizations o on l.organizationID = o.organizationID" +
      " left join Locations lo on l.locationID = lo.locationID" +
      sqlWhereClause)
      .get(sqlParams)
      .cnt;
  }

  let sql = "select l.licenceID, l.organizationID," +
    (includeOptions.includeOrganization
      ? " o.organizationName,"
      : "") +
    " l.applicationDate, l.licenceTypeKey," +
    " l.startDate, l.startTime, l.endDate, l.endTime," +
    " l.locationID, lo.locationName, lo.locationAddress1," +
    " l.municipality, l.licenceDetails, l.termsConditions," +
    " l.externalLicenceNumber, l.issueDate," +
    " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
    " from LotteryLicences l" +
    " left join Locations lo on l.locationID = lo.locationID" +
    (includeOptions.includeOrganization
      ? " left join Organizations o on l.organizationID = o.organizationID"
      : ""
    ) +
    sqlWhereClause +
    " order by l.endDate desc, l.startDate desc, l.licenceID";

  if (includeOptions.limit !== -1) {
    sql += " limit " + includeOptions.limit.toString() +
      " offset " + includeOptions.offset.toString();
  }

  const rows: llm.LotteryLicence[] =
    db.prepare(sql)
      .all(sqlParams);

  db.close();


  for (const ele of rows) {

    ele.recordType = "licence";

    ele.applicationDateString = dateTimeFns.dateIntegerToString(ele.applicationDate || 0);

    ele.startDateString = dateTimeFns.dateIntegerToString(ele.startDate || 0);
    ele.endDateString = dateTimeFns.dateIntegerToString(ele.endDate || 0);

    ele.startTimeString = dateTimeFns.timeIntegerToString(ele.startTime || 0);
    ele.endTimeString = dateTimeFns.timeIntegerToString(ele.endTime || 0);

    ele.issueDateString = dateTimeFns.dateIntegerToString(ele.issueDate || 0);

    ele.locationDisplayName =
      (ele.locationName === "" ? ele.locationAddress1 : ele.locationName);

    ele.canUpdate = canUpdateObject(ele, reqSession);
  }

  return {
    count: (includeOptions.limit === -1 ? rows.length : count),
    licences: rows
  };
};
