import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import { getLicences } from "../../helpers/licencesDB/getLicences";
import { getOrganization } from "../../helpers/licencesDB/getOrganization";

import { getOrganizationRemarks } from "../../helpers/licencesDB/getOrganizationRemarks";
import { getOrganizationReminders } from "../../helpers/licencesDB/getOrganizationReminders";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (req, res, next) => {

  const organizationID = Number(req.params.organizationID);

  if (isNaN(organizationID)) {
    return next();
  }

  const organization = getOrganization(organizationID, req.session);

  if (!organization) {
    return res.redirect(urlPrefix + "/organizations/?error=organizationNotFound");
  }

  const licences = getLicences({ organizationID },
    req.session, {
      includeOrganization: false,
      limit: -1
    }).licences || [];

  const remarks = getOrganizationRemarks(organizationID, req.session) || [];

  const reminders = getOrganizationReminders(organizationID, req.session) || [];

  res.render("organization-view", {
    headTitle: organization.organizationName,
    isViewOnly: true,
    organization,
    licences,
    remarks,
    reminders,
    currentDateInteger: dateTimeFns.dateToInteger(new Date())
  });

};
