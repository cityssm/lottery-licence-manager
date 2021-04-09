import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import type * as expressSession from "express-session";


export const createEventWithDB = (db: sqlite.Database,
  licenceID: string | number, eventDateString: string,
  reqSession: expressSession.Session) => {

  const nowMillis = Date.now();

  db.prepare("insert or ignore into LotteryEvents (" +
    "licenceID, eventDate," +
    " recordCreate_userName, recordCreate_timeMillis," +
    " recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?)")
    .run(
      licenceID,
      dateTimeFns.dateStringToInteger(eventDateString),
      reqSession.user.userName,
      nowMillis,
      reqSession.user.userName,
      nowMillis
    );
};
