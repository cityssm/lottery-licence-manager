export const getMaxLicenceTicketTypeIndexWithDB = (database, licenceID) => {
    const result = database.prepare("select ticketTypeIndex" +
        " from LotteryLicenceTicketTypes" +
        " where licenceID = ?" +
        " order by ticketTypeIndex desc" +
        " limit 1")
        .get(licenceID);
    return (result
        ? result.ticketTypeIndex
        : -1);
};
