import { runSQLWithDB } from "../_runSQLByName.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import type { Session } from "express-session";
import type * as sqlite from "better-sqlite3";


export const createEventWithDB = (database: sqlite.Database,
  licenceID: string | number, eventDateString: string,
  requestSession: Session): void => {

  const nowMillis = Date.now();

  runSQLWithDB(database,
    "insert or ignore into LotteryEvents (" +
    "licenceID, eventDate," +
    " recordCreate_userName, recordCreate_timeMillis," +
    " recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?)", [
      licenceID,
      dateTimeFns.dateStringToInteger(eventDateString),
      requestSession.user.userName,
      nowMillis,
      requestSession.user.userName,
      nowMillis
    ]);
};
