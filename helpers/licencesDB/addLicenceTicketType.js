export const addLicenceTicketTypeWithDB = (database, ticketTypeDefinition, requestSession) => {
    const nowMillis = Date.now();
    database.prepare("insert into LotteryLicenceTicketTypes" +
        " (licenceID, ticketTypeIndex," +
        " amendmentDate, ticketType," +
        " unitCount, licenceFee," +
        " distributorLocationID, manufacturerLocationID," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(ticketTypeDefinition.licenceID, ticketTypeDefinition.ticketTypeIndex, ticketTypeDefinition.amendmentDate, ticketTypeDefinition.ticketType, ticketTypeDefinition.unitCount, ticketTypeDefinition.licenceFee, (ticketTypeDefinition.distributorLocationID === ""
        ? undefined
        : ticketTypeDefinition.distributorLocationID), (ticketTypeDefinition.manufacturerLocationID === ""
        ? undefined
        : ticketTypeDefinition.manufacturerLocationID), requestSession.user.userName, nowMillis, requestSession.user.userName, nowMillis);
};
