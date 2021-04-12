import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";


export const handler: RequestHandler = (_req, res) => {

  res.render("organization-edit", {
    headTitle: "Organization Create",
    isViewOnly: false,
    isCreate: true,
    organization: {
      organizationCity: configFns.getProperty("defaults.city"),
      organizationProvince: configFns.getProperty("defaults.province")
    }
  });
};
