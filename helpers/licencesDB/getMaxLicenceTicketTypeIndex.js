"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxLicenceTicketTypeIndexWithDB = void 0;
const getMaxLicenceTicketTypeIndexWithDB = (db, licenceID) => {
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
exports.getMaxLicenceTicketTypeIndexWithDB = getMaxLicenceTicketTypeIndexWithDB;
