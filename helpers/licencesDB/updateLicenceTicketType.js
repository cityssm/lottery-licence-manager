import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const updateLicenceTicketTypeWithDB = (database, ticketTypeDefinition, requestSession) => {
    const nowMillis = Date.now();
    database
        .prepare("update LotteryLicenceTicketTypes" +
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
        .run(ticketTypeDefinition.distributorLocationID === ""
        ? undefined
        : ticketTypeDefinition.distributorLocationID, ticketTypeDefinition.manufacturerLocationID === ""
        ? undefined
        : ticketTypeDefinition.manufacturerLocationID, ticketTypeDefinition.unitCount, ticketTypeDefinition.licenceFee, requestSession.user.userName, nowMillis, ticketTypeDefinition.licenceID, dateTimeFns.dateStringToInteger(ticketTypeDefinition.eventDateString), ticketTypeDefinition.ticketType);
};
