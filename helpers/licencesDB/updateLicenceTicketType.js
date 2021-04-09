"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLicenceTicketTypeWithDB = void 0;
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const updateLicenceTicketTypeWithDB = (db, ticketTypeDef, reqSession) => {
    const nowMillis = Date.now();
    db.prepare("update LotteryLicenceTicketTypes" +
        " set distributorLocationID = ?," +
        " manufacturerLocationID = ?," +
        " unitCount = ?," +
        " licenceFee = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and ticketType = ?" +
        " and recordDelete_timeMillis is null")
        .run((ticketTypeDef.distributorLocationID === ""
        ? null
        : ticketTypeDef.distributorLocationID), (ticketTypeDef.manufacturerLocationID === ""
        ? null
        : ticketTypeDef.manufacturerLocationID), ticketTypeDef.unitCount, ticketTypeDef.licenceFee, reqSession.user.userName, nowMillis, ticketTypeDef.licenceID, dateTimeFns.dateStringToInteger(ticketTypeDef.eventDateString), ticketTypeDef.ticketType);
};
exports.updateLicenceTicketTypeWithDB = updateLicenceTicketTypeWithDB;
