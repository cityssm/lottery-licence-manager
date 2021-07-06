import sqlite from "better-sqlite3";
import { licencesDB as databasePath } from "../../data/databasePaths.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../licencesDB.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const getOrganization = (organizationID: number, requestSession: expressSession.Session): llm.Organization => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const organizationObject: llm.Organization =
    database.prepare("select * from Organizations" +
      " where organizationID = ?")
      .get(organizationID);

  if (organizationObject) {

    organizationObject.recordType = "organization";

    organizationObject.fiscalStartDateString = dateTimeFns.dateIntegerToString(organizationObject.fiscalStartDate);
    organizationObject.fiscalEndDateString = dateTimeFns.dateIntegerToString(organizationObject.fiscalEndDate);

    organizationObject.canUpdate = canUpdateObject(organizationObject, requestSession);

    const representativesList: llm.OrganizationRepresentative[] =
      database.prepare("select * from OrganizationRepresentatives" +
        " where organizationID = ?" +
        " order by isDefault desc, representativeName")
        .all(organizationID);

    organizationObject.organizationRepresentatives = representativesList;

  }

  database.close();

  return organizationObject;
};


export default getOrganization;
