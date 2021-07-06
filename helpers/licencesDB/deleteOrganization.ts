import { runSQL_hasChanges } from "./_runSQL.js";

import type * as expressSession from "express-session";


export const deleteOrganization = (organizationID: number, requestSession: expressSession.Session): boolean => {

  return runSQL_hasChanges("update Organizations" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where organizationID = ?" +
    " and recordDelete_timeMillis is null", [
      requestSession.user.userName,
      Date.now(),
      organizationID
    ]);
};
