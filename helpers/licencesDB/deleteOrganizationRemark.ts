import { runSQL_hasChanges } from "./_runSQL.js";

import type * as expressSession from "express-session";


export const deleteOrganizationRemark =
  (organizationID: number, remarkIndex: number, reqSession: expressSession.Session) => {

    return runSQL_hasChanges("update OrganizationRemarks" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where organizationID = ?" +
      " and remarkIndex = ?" +
      " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        Date.now(),
        organizationID,
        remarkIndex
      ]);
  };
