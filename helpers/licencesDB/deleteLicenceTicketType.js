"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLicenceTicketTypeWithDB = void 0;
const deleteLicenceTicketTypeWithDB = (db, ticketTypeDef, reqSession) => {
    const nowMillis = Date.now();
    db.prepare("update LotteryLicenceTicketTypes" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and ticketType = ?")
        .run(reqSession.user.userName, nowMillis, ticketTypeDef.licenceID, ticketTypeDef.eventDate, ticketTypeDef.ticketType);
};
exports.deleteLicenceTicketTypeWithDB = deleteLicenceTicketTypeWithDB;
