export const addLicenceTicketTypeWithDB = (db, ticketTypeDef, reqSession) => {
    const nowMillis = Date.now();
    db.prepare("insert into LotteryLicenceTicketTypes" +
        " (licenceID, ticketTypeIndex," +
        " amendmentDate, ticketType," +
        " unitCount, licenceFee," +
        " distributorLocationID, manufacturerLocationID," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(ticketTypeDef.licenceID, ticketTypeDef.ticketTypeIndex, ticketTypeDef.amendmentDate, ticketTypeDef.ticketType, ticketTypeDef.unitCount, ticketTypeDef.licenceFee, (ticketTypeDef.distributorLocationID === ""
        ? null
        : ticketTypeDef.distributorLocationID), (ticketTypeDef.manufacturerLocationID === ""
        ? null
        : ticketTypeDef.manufacturerLocationID), reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
};
