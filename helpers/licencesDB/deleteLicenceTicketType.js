import { runSQLWithDB } from "../_runSQLByName.js";
export const deleteLicenceTicketTypeWithDB = (database, ticketTypeDefinition, requestSession) => {
    return runSQLWithDB(database, "update LotteryLicenceTicketTypes" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and ticketTypeIndex = ?", [
        requestSession.user.userName,
        Date.now(),
        ticketTypeDefinition.licenceID,
        ticketTypeDefinition.ticketTypeIndex
    ]);
};
