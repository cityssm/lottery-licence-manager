import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import type sqlite from "better-sqlite3";
import type * as expressSession from "express-session";

export const updateLicenceTicketTypeWithDB = (
    database: sqlite.Database,
    ticketTypeDefinition: {
        licenceID: number | string;
        eventDateString: string;
        ticketType: string;
        unitCount: number | string;
        licenceFee: number | string;
        distributorLocationID: number | string;
        manufacturerLocationID: number | string;
    },
    requestSession: expressSession.Session
): void => {
    const nowMillis = Date.now();

    database
        .prepare(
            "update LotteryLicenceTicketTypes" +
                " set distributorLocationID = ?," +
                " manufacturerLocationID = ?," +
                " unitCount = ?," +
                " licenceFee = ?," +
                " recordUpdate_userName = ?," +
                " recordUpdate_timeMillis = ?" +
                " where licenceID = ?" +
                " and eventDate = ?" +
                " and ticketType = ?" +
                " and recordDelete_timeMillis is null"
        )
        .run(
            ticketTypeDefinition.distributorLocationID === ""
                ? undefined
                : ticketTypeDefinition.distributorLocationID,
            ticketTypeDefinition.manufacturerLocationID === ""
                ? undefined
                : ticketTypeDefinition.manufacturerLocationID,
            ticketTypeDefinition.unitCount,
            ticketTypeDefinition.licenceFee,
            requestSession.user.userName,
            nowMillis,
            ticketTypeDefinition.licenceID,
            dateTimeFns.dateStringToInteger(ticketTypeDefinition.eventDateString),
            ticketTypeDefinition.ticketType
        );
};
