import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import type { ConfigReportDefinition } from "../../types/configTypes";


export const reports: { [reportName: string]: ConfigReportDefinition } = {

  "locations-all": {
    sql: "select * from Locations"
  },

  "locations-formatted": {
    sql: "select locationName," +
      " locationAddress1, locationAddress2, locationCity, locationProvince, locationPostalCode" +
      " from Locations" +
      " where locationID in (select locationID from LotteryLicences)" +
      " and recordDelete_timeMillis is null" +
      " order by locationName"
  },

  "locations-unused": {

    sql: "select lo.locationID, lo.locationName," +
      " lo.locationAddress1, lo.locationAddress2, lo.locationCity, lo.locationProvince," +
      " l.licences_endDateMax, d.distributor_endDateMax, m.manufacturer_endDateMax" +
      " from Locations lo" +

      (" left join (" +
        "select locationID, max(endDate) as licences_endDateMax" +
        " from LotteryLicences" +
        " where recordDelete_timeMillis is null" +
        " group by locationID" +
        ") l on lo.locationID = l.locationID") +

      (" left join (" +
        "select t.distributorLocationID," +
        " max(l.endDate) as distributor_endDateMax" +
        " from LotteryLicenceTicketTypes t" +
        " left join LotteryLicences l on t.licenceID = l.licenceID" +
        " where t.recordDelete_timeMillis is null" +
        " group by t.distributorLocationID" +
        ") d on lo.locationID = d.distributorLocationID") +

      (" left join (" +
        "select t.manufacturerLocationID, max(l.endDate) as manufacturer_endDateMax" +
        " from LotteryLicenceTicketTypes t" +
        " left join LotteryLicences l on t.licenceID = l.licenceID" +
        " where t.recordDelete_timeMillis is null" +
        " group by t.manufacturerLocationID" +
        ") m on lo.locationID = m.manufacturerLocationID") +

      " where lo.recordDelete_timeMillis is null" +

      " group by lo.locationID, lo.locationName," +
      " lo.locationAddress1, lo.locationAddress2, lo.locationCity, lo.locationProvince," +
      " l.licences_endDateMax, d.distributor_endDateMax, m.manufacturer_endDateMax" +

      (" having max(" +
        "ifnull(l.licences_endDateMax, 0)," +
        " ifnull(d.distributor_endDateMax, 0)," +
        " ifnull(m.manufacturer_endDateMax, 0)) <= ?"),

    params: () => {

      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

      return [dateTimeFns.dateToInteger(threeYearsAgo)];
    }
  },

  "locations-distributors": {
    sql: "select locationID, locationName," +
      " locationAddress1, locationAddress2, locationCity, locationProvince, locationPostalCode" +
      " from Locations" +
      " where locationIsDistributor = 1" +
      " and recordDelete_timeMillis is null"
  },

  "locations-manufacturers": {
    sql: "select locationID, locationName," +
      " locationAddress1, locationAddress2, locationCity, locationProvince, locationPostalCode" +
      " from Locations" +
      " where locationIsManufacturer = 1" +
      " and recordDelete_timeMillis is null"
  }
};


export default reports;
