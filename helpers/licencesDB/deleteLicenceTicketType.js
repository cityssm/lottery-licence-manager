"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLicenceTicketTypeWithDB = void 0;
const _runSQLByName_1 = require("../_runSQLByName");
const deleteLicenceTicketTypeWithDB = (db, ticketTypeDef, reqSession) => {
    return _runSQLByName_1.runSQLWithDB(db, "update LotteryLicenceTicketTypes" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where licenceID = ?" +
        " and eventDate = ?" +
        " and ticketType = ?", [
        reqSession.user.userName,
        Date.now(),
        ticketTypeDef.licenceID,
        ticketTypeDef.eventDate,
        ticketTypeDef.ticketType
    ]);
};
exports.deleteLicenceTicketTypeWithDB = deleteLicenceTicketTypeWithDB;
