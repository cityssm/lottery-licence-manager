export const deleteLicenceTicketTypeWithDB = (database, ticketTypeDefinition, requestSession) => {
    return database.prepare("update LotteryLicenceTicketTypes" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and ticketTypeIndex = ?")
        .run(requestSession.user.userName, Date.now(), ticketTypeDefinition.licenceID, ticketTypeDefinition.ticketTypeIndex);
};
