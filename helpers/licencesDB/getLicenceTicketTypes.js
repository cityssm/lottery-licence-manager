"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLicenceTicketTypesWithDB = void 0;
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const getLicenceTicketTypesWithDB = (db, licenceID) => {
    db.function("userFn_dateIntegerToString", dateTimeFns.dateIntegerToString);
    const ticketTypesList = db.prepare("select t.ticketTypeIndex," +
        " t.amendmentDate," +
        " userFn_dateIntegerToString(t.amendmentDate) as amendmentDateString," +
        " t.ticketType," +
        " t.distributorLocationID," +
        " d.locationName as distributorLocationName," +
        " d.locationAddress1 as distributorLocationAddress1," +
        " iif(d.locationName = '', d.locationAddress1, d.locationName) as distributorLocationDisplayName," +
        " t.manufacturerLocationID," +
        " m.locationName as manufacturerLocationName," +
        " m.locationAddress1 as manufacturerLocationAddress1," +
        " iif(m.locationName = '', m.locationAddress1, m.locationName) as manufacturerLocationDisplayName," +
        " t.unitCount," +
        " ifnull(t.licenceFee, 0) as licenceFee" +
        " from LotteryLicenceTicketTypes t" +
        " left join Locations d on t.distributorLocationID = d.locationID" +
        " left join Locations m on t.manufacturerLocationID = m.locationID" +
        " where t.recordDelete_timeMillis is null" +
        " and t.licenceID = ?" +
        " order by t.ticketTypeIndex")
        .all(licenceID);
    return ticketTypesList;
};
exports.getLicenceTicketTypesWithDB = getLicenceTicketTypesWithDB;
