import { runSQL_hasChanges } from "./_runSQL.js";

import type * as expressSession from "express-session";


export const deleteOrganizationBankRecord =
  (organizationID: number, recordIndex: number, requestSession: expressSession.Session): boolean => {

    return runSQL_hasChanges("update OrganizationBankRecords" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where organizationID = ?" +
      " and recordIndex = ?" +
      " and recordDelete_timeMillis is null", [
        requestSession.user.userName,
        Date.now(),
        organizationID,
        recordIndex
      ]);
  };
