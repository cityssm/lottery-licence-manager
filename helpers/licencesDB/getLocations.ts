import { canUpdateObject } from "../licencesDB.js";
import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import { licencesDB as databasePath } from "../../data/databasePaths.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


interface GetLocationsReturn {
  count: number;
  locations: llm.Location[];
}


export const getLocations = (requestSession: expressSession.Session, queryOptions: {
  limit: number;
  offset: number;
  locationNameAddress?: string;
  locationIsDistributor: number;
  locationIsManufacturer: number;
  locationIsActive?: "on";
}): GetLocationsReturn => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  // build where clause

  const sqlParameters = [];

  let sqlWhereClause = " where lo.recordDelete_timeMillis is null";

  if (queryOptions.locationNameAddress && queryOptions.locationNameAddress !== "") {

    const locationNameAddressSplit = queryOptions.locationNameAddress.toLowerCase().split(" ");

    for (const locationPiece of locationNameAddressSplit) {

      sqlWhereClause += " and (instr(lower(lo.locationName), ?) or instr(lower(lo.locationAddress1),?))";
      sqlParameters.push(locationPiece, locationPiece);
    }
  }

  if (queryOptions.locationIsDistributor !== -1) {

    sqlWhereClause += " and lo.locationIsDistributor = ?";
    sqlParameters.push(queryOptions.locationIsDistributor);

  }

  if (queryOptions.locationIsManufacturer !== -1) {

    sqlWhereClause += " and lo.locationIsManufacturer = ?";
    sqlParameters.push(queryOptions.locationIsManufacturer);

  }

  if (queryOptions.locationIsActive) {

    const currentDate = dateTimeFns.dateToInteger(new Date());

    sqlWhereClause += " and (lo.locationID in (" +
      "select lx.locationID from LotteryLicences lx" +
      " where lx.recordDelete_timeMillis is null" +
      " and lx.issueDate is not null and lx.endDate >= ?))";

    sqlParameters.push(currentDate);
  }

  // if limit is used, get the count

  let count = 0;

  if (queryOptions.limit !== -1) {

    count = database.prepare("select ifnull(count(*), 0) as cnt" +
      " from Locations lo" +
      sqlWhereClause)
      .get(sqlParameters)
      .cnt;
  }

  let sql = "select lo.locationID, lo.locationName," +
    " lo.locationAddress1, lo.locationAddress2, lo.locationCity, lo.locationProvince," +
    " lo.locationIsDistributor, lo.locationIsManufacturer," +
    " l.licences_endDateMax, coalesce(l.licences_count, 0) as licences_count," +
    " d.distributor_endDateMax, coalesce(d.distributor_count, 0) as distributor_count," +
    " m.manufacturer_endDateMax, coalesce(m.manufacturer_count, 0) as manufacturer_count" +
    " from Locations lo" +

    (" left join (" +
      "select locationID," +
      " count(licenceID) as licences_count, max(endDate) as licences_endDateMax" +
      " from LotteryLicences" +
      " where recordDelete_timeMillis is null" +
      " group by locationID" +
      ") l on lo.locationID = l.locationID") +

    (" left join (" +
      "select t.distributorLocationID," +
      " count(*) as distributor_count, max(l.endDate) as distributor_endDateMax" +
      " from LotteryLicenceTicketTypes t" +
      " left join LotteryLicences l on t.licenceID = l.licenceID" +
      " where t.recordDelete_timeMillis is null" +
      " group by t.distributorLocationID" +
      ") d on lo.locationID = d.distributorLocationID") +

    (" left join (" +
      "select t.manufacturerLocationID," +
      " count(*) as manufacturer_count, max(l.endDate) as manufacturer_endDateMax" +
      " from LotteryLicenceTicketTypes t" +
      " left join LotteryLicences l on t.licenceID = l.licenceID" +
      " where t.recordDelete_timeMillis is null" +
      " group by t.manufacturerLocationID" +
      ") m on lo.locationID = m.manufacturerLocationID") +

    sqlWhereClause +

    " order by case when lo.locationName = '' then lo.locationAddress1 else lo.locationName end";

  if (queryOptions.limit !== -1) {
    sql += " limit " + queryOptions.limit.toString() +
      " offset " + queryOptions.offset.toString();
  }

  const rows: llm.Location[] =
    database.prepare(sql).all(sqlParameters);

  database.close();

  for (const element of rows) {

    element.recordType = "location";

    element.locationDisplayName =
      element.locationName === "" ? element.locationAddress1 : element.locationName;

    element.licences_endDateMaxString = dateTimeFns.dateIntegerToString(element.licences_endDateMax);
    element.distributor_endDateMaxString = dateTimeFns.dateIntegerToString(element.distributor_endDateMax);
    element.manufacturer_endDateMaxString = dateTimeFns.dateIntegerToString(element.manufacturer_endDateMax);

    element.canUpdate = canUpdateObject(element, requestSession);
  }


  return {
    count: (queryOptions.limit === -1 ? rows.length : count),
    locations: rows
  };

};
