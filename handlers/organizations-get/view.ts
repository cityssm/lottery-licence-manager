import type { RequestHandler } from "express";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import * as licencesDB_getLicences from "../../helpers/licencesDB/getLicences";
import * as licencesDB_getOrganization from "../../helpers/licencesDB/getOrganization";

import * as licencesDB_getOrganizationRemarks from "../../helpers/licencesDB/getOrganizationRemarks";
import * as licencesDB_getOrganizationReminders from "../../helpers/licencesDB/getOrganizationReminders";


export const handler: RequestHandler = (req, res) => {

  const organizationID = parseInt(req.params.organizationID, 10);

  const organization = licencesDB_getOrganization.getOrganization(organizationID, req.session);

  if (!organization) {

    res.redirect("/organizations/?error=organizationNotFound");
    return;

  }

  const licences = licencesDB_getLicences.getLicences(
    {
      organizationID
    },
    req.session,
    {
      includeOrganization: false,
      limit: -1
    }).licences || [];

  const remarks = licencesDB_getOrganizationRemarks.getOrganizationRemarks(organizationID, req.session) || [];

  const reminders = licencesDB_getOrganizationReminders.getOrganizationReminders(organizationID, req.session) || [];

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
