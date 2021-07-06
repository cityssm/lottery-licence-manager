import { runSQL_hasChanges } from "./_runSQL.js";

import type * as expressSession from "express-session";


export const deleteOrganizationRemark =
  (organizationID: number, remarkIndex: number, requestSession: expressSession.Session): boolean => {

    return runSQL_hasChanges("update OrganizationRemarks" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where organizationID = ?" +
      " and remarkIndex = ?" +
      " and recordDelete_timeMillis is null", [
        requestSession.user.userName,
        Date.now(),
        organizationID,
        remarkIndex
      ]);
  };
