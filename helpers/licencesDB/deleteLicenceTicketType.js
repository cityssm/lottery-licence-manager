import { runSQLWithDB } from "../_runSQLByName.js";
export const deleteLicenceTicketTypeWithDB = (db, ticketTypeDef, reqSession) => {
    return runSQLWithDB(db, "update LotteryLicenceTicketTypes" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and ticketType = ?", [
        reqSession.user.userName,
        Date.now(),
        ticketTypeDef.licenceID,
        ticketTypeDef.eventDate,
        ticketTypeDef.ticketType
    ]);
};
