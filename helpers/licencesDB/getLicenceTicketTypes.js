"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLicenceTicketTypesWithDB = void 0;
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const getLicenceTicketTypesWithDB = (db, licenceID) => {
    const ticketTypesList = db.prepare("select t.eventDate, t.ticketType," +
        " t.distributorLocationID," +
        " d.locationName as distributorLocationName, d.locationAddress1 as distributorLocationAddress1," +
        " t.manufacturerLocationID," +
        " m.locationName as manufacturerLocationName, m.locationAddress1 as manufacturerLocationAddress1," +
        " t.unitCount, t.licenceFee" +
        " from LotteryLicenceTicketTypes t" +
        " left join Locations d on t.distributorLocationID = d.locationID" +
        " left join Locations m on t.manufacturerLocationID = m.locationID" +
        " where t.recordDelete_timeMillis is null" +
        " and t.licenceID = ?" +
        " order by t.eventDate, t.ticketType")
        .all(licenceID);
    for (const ticketTypeObj of ticketTypesList) {
        ticketTypeObj.eventDateString = dateTimeFns.dateIntegerToString(ticketTypeObj.eventDate);
        ticketTypeObj.distributorLocationDisplayName = ticketTypeObj.distributorLocationName === ""
            ? ticketTypeObj.distributorLocationAddress1
            : ticketTypeObj.distributorLocationName;
        ticketTypeObj.manufacturerLocationDisplayName = ticketTypeObj.manufacturerLocationName === ""
            ? ticketTypeObj.manufacturerLocationAddress1
            : ticketTypeObj.manufacturerLocationName;
    }
    return ticketTypesList;
};
exports.getLicenceTicketTypesWithDB = getLicenceTicketTypesWithDB;
