import { canUpdateObject } from "../licencesDB";
import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import { licencesDB as dbPath } from "../../data/databasePaths";

import * as llm from "../../types/recordTypes";


export const getLocations = (reqSession: Express.SessionData, queryOptions: {
  limit: number;
  offset: number;
  locationNameAddress?: string;
  locationIsDistributor: number;
  locationIsManufacturer: number;
  locationIsActive?: "on";
}) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  // build where clause

  const sqlParams = [];

  let sqlWhereClause = " where lo.recordDelete_timeMillis is null";

  if (queryOptions.locationNameAddress && queryOptions.locationNameAddress !== "") {

    const locationNameAddressSplit = queryOptions.locationNameAddress.toLowerCase().split(" ");

    for (const locationPiece of locationNameAddressSplit) {

      sqlWhereClause += " and (instr(lower(lo.locationName), ?) or instr(lower(lo.locationAddress1),?))";
      sqlParams.push(locationPiece);
      sqlParams.push(locationPiece);
    }
  }

  if (queryOptions.locationIsDistributor !== -1) {

    sqlWhereClause += " and lo.locationIsDistributor = ?";
    sqlParams.push(queryOptions.locationIsDistributor);

  }

  if (queryOptions.locationIsManufacturer !== -1) {

    sqlWhereClause += " and lo.locationIsManufacturer = ?";
    sqlParams.push(queryOptions.locationIsManufacturer);

  }

  if (queryOptions.locationIsActive) {

    const currentDate = dateTimeFns.dateToInteger(new Date());

    sqlWhereClause += " and (lo.locationID in (" +
      "select lx.locationID from LotteryLicences lx" +
      " where lx.recordDelete_timeMillis is null" +
      " and lx.issueDate is not null and lx.endDate >= ?))";

    sqlParams.push(currentDate);
  }

  // if limit is used, get the count

  let count = 0;

  if (queryOptions.limit !== -1) {

    count = db.prepare("select ifnull(count(*), 0) as cnt" +
      " from Locations lo" +
      sqlWhereClause)
      .get(sqlParams)
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
    db.prepare(sql).all(sqlParams);

  db.close();

  for (const ele of rows) {

    ele.recordType = "location";

    ele.locationDisplayName =
      ele.locationName === "" ? ele.locationAddress1 : ele.locationName;

    ele.licences_endDateMaxString = dateTimeFns.dateIntegerToString(ele.licences_endDateMax);
    ele.distributor_endDateMaxString = dateTimeFns.dateIntegerToString(ele.distributor_endDateMax);
    ele.manufacturer_endDateMaxString = dateTimeFns.dateIntegerToString(ele.manufacturer_endDateMax);

    ele.canUpdate = canUpdateObject(ele, reqSession);
  }


  return {
    count: (queryOptions.limit === -1 ? rows.length : count),
    locations: rows
  };

};
