export const getMaxLicenceTicketTypeIndexWithDB = (db, licenceID) => {
    const result = db.prepare("select ticketTypeIndex" +
        " from LotteryLicenceTicketTypes" +
        " where licenceID = ?" +
        " order by ticketTypeIndex desc" +
        " limit 1")
        .get(licenceID);
    return (result
        ? result.ticketTypeIndex
        : -1);
};
