"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLicenceTicketTypeWithDB = void 0;
const addLicenceTicketTypeWithDB = (db, ticketTypeDef, reqSession) => {
    const nowMillis = Date.now();
    const addInfo = db
        .prepare("update LotteryLicenceTicketTypes" +
        " set recordDelete_userName = null," +
        " recordDelete_timeMillis = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and ticketType = ?" +
        " and recordDelete_timeMillis is not null")
        .run(reqSession.user.userName, nowMillis, ticketTypeDef.licenceID, ticketTypeDef.eventDate, ticketTypeDef.ticketType);
    if (addInfo.changes === 0) {
        db.prepare("insert or ignore into LotteryLicenceTicketTypes" +
            " (licenceID, eventDate, ticketType, unitCount," +
            " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
            " values (?, ?, ?, ?, ?, ?, ?, ?)")
            .run(ticketTypeDef.licenceID, ticketTypeDef.eventDate, ticketTypeDef.ticketType, 0, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    }
};
exports.addLicenceTicketTypeWithDB = addLicenceTicketTypeWithDB;
