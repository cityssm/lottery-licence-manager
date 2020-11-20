import * as sqlite from "better-sqlite3";
import { licencesDB as dbPath } from "../../data/databasePaths";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import { canUpdateObject } from "../licencesDB";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const getOrganization = (organizationID: number, reqSession: expressSession.Session): llm.Organization => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const organizationObj: llm.Organization =
    db.prepare("select * from Organizations" +
      " where organizationID = ?")
      .get(organizationID);

  if (organizationObj) {

    organizationObj.recordType = "organization";

    organizationObj.fiscalStartDateString = dateTimeFns.dateIntegerToString(organizationObj.fiscalStartDate);
    organizationObj.fiscalEndDateString = dateTimeFns.dateIntegerToString(organizationObj.fiscalEndDate);

    organizationObj.canUpdate = canUpdateObject(organizationObj, reqSession);

    const representativesList: llm.OrganizationRepresentative[] =
      db.prepare("select * from OrganizationRepresentatives" +
        " where organizationID = ?" +
        " order by isDefault desc, representativeName")
        .all(organizationID);

    organizationObj.organizationRepresentatives = representativesList;

  }

  db.close();

  return organizationObj;
};
