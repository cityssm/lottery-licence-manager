import { runSQL_hasChanges } from "./_runSQL";

import type * as expressSession from "express-session";


export const deleteOrganizationBankRecord =
  (organizationID: number, recordIndex: number, reqSession: expressSession.Session) => {

    return runSQL_hasChanges("update OrganizationBankRecords" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where organizationID = ?" +
      " and recordIndex = ?" +
      " and recordDelete_timeMillis is null", [
        reqSession.user.userName,
        Date.now(),
        organizationID,
        recordIndex
      ]);
  };
