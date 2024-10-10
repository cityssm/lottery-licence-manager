export function deleteLicenceTicketTypeWithDB(database, ticketTypeDefinition, requestUser) {
    return database
        .prepare(`update LotteryLicenceTicketTypes
        set recordDelete_userName = ?, recordDelete_timeMillis = ?
        where licenceID = ? and ticketTypeIndex = ?`)
        .run(requestUser.userName, Date.now(), ticketTypeDefinition.licenceID, ticketTypeDefinition.ticketTypeIndex);
}
