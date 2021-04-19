import { runSQLWithDB } from "../_runSQLByName.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const updateLicenceTicketTypeWithDB = (db, ticketTypeDef, reqSession) => {
    const nowMillis = Date.now();
    runSQLWithDB(db, "update LotteryLicenceTicketTypes" +
        " set distributorLocationID = ?," +
        " manufacturerLocationID = ?," +
        " unitCount = ?," +
        " licenceFee = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and ticketType = ?" +
        " and recordDelete_timeMillis is null", [
        (ticketTypeDef.distributorLocationID === ""
            ? null
            : ticketTypeDef.distributorLocationID),
        (ticketTypeDef.manufacturerLocationID === ""
            ? null
            : ticketTypeDef.manufacturerLocationID),
        ticketTypeDef.unitCount,
        ticketTypeDef.licenceFee,
        reqSession.user.userName,
        nowMillis,
        ticketTypeDef.licenceID,
        dateTimeFns.dateStringToInteger(ticketTypeDef.eventDateString),
        ticketTypeDef.ticketType
    ]);
};
