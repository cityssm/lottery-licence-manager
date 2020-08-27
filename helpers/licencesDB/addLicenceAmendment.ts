import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";


export const addLicenceAmendmentWithDB = (db: sqlite.Database,
  licenceID: number | string, amendmentType: string, amendment: string, isHidden: number,
  reqSession: Express.SessionData) => {

  const amendmentIndexRecord: {
    amendmentIndex: number;
  } = db.prepare("select amendmentIndex" +
    " from LotteryLicenceAmendments" +
    " where licenceID = ?" +
    " order by amendmentIndex desc" +
    " limit 1")
    .get(licenceID);

  const amendmentIndex: number = (amendmentIndexRecord ? amendmentIndexRecord.amendmentIndex : 0) + 1;

  const nowDate = new Date();

  const amendmentDate = dateTimeFns.dateToInteger(nowDate);
  const amendmentTime = dateTimeFns.dateToTimeInteger(nowDate);

  db.prepare("insert into LotteryLicenceAmendments" +
    " (licenceID, amendmentIndex, amendmentDate, amendmentTime, amendmentType, amendment, isHidden," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      licenceID,
      amendmentIndex,
      amendmentDate,
      amendmentTime,
      amendmentType,
      amendment,
      isHidden,
      reqSession.user.userName,
      nowDate.getTime(),
      reqSession.user.userName,
      nowDate.getTime()
    );

  return amendmentIndex;
};
