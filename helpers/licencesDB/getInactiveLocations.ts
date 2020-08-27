import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import * as llm from "../../types/recordTypes";


export const getInactiveLocations = (inactiveYears: number) => {

  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - inactiveYears);

  const cutoffDateInteger = dateTimeFns.dateToInteger(cutoffDate);

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: llm.Location[] = db.prepare("select lo.locationID, lo.locationName, lo.locationAddress1," +
    " lo.recordUpdate_timeMillis, lo.recordUpdate_userName," +
    " l.licences_endDateMax, d.distributor_endDateMax, m.manufacturer_endDateMax" +
    " from Locations lo" +

    (" left join (" +
      "select l.locationID, max(l.endDate) as licences_endDateMax from LotteryLicences l" +
      " where l.recordDelete_timeMillis is null" +
      " group by l.locationID" +
      ") l on lo.locationID = l.locationID") +

    (" left join (" +
      "select tt.distributorLocationID, max(l.endDate) as distributor_endDateMax" +
      " from LotteryLicenceTicketTypes tt" +
      " left join LotteryLicences l on tt.licenceID = l.licenceID" +
      " where l.recordDelete_timeMillis is null" +
      " group by tt.distributorLocationID" +
      ") d on lo.locationID = d.distributorLocationID") +

    (" left join (" +
      "select tt.manufacturerLocationID, max(l.endDate) as manufacturer_endDateMax" +
      " from LotteryLicenceTicketTypes tt" +
      " left join LotteryLicences l on tt.licenceID = l.licenceID" +
      " where l.recordDelete_timeMillis is null" +
      " group by tt.manufacturerLocationID" +
      ") m on lo.locationID = m.manufacturerLocationID") +

    " where lo.recordDelete_timeMillis is null" +

    (" and max(ifnull(l.licences_endDateMax, 0)," +
      " ifnull(d.distributor_endDateMax, 0)," +
      " ifnull(m.manufacturer_endDateMax, 0)) <= ?") +

    " order by lo.locationName, lo.locationAddress1, lo.locationID")
    .all(cutoffDateInteger);

  db.close();

  for (const locationObj of rows) {

    locationObj.locationDisplayName =
      locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName;

    locationObj.recordUpdate_dateString = dateTimeFns.dateToString(new Date(locationObj.recordUpdate_timeMillis));

    locationObj.licences_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.licences_endDateMax || 0);
    locationObj.distributor_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.distributor_endDateMax || 0);

    locationObj.manufacturer_endDateMaxString =
      dateTimeFns.dateIntegerToString(locationObj.manufacturer_endDateMax || 0);
  }

  return rows;
};
