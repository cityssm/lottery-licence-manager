import type { RequestHandler } from "express";

import * as path from "path";
import * as ejs from "ejs";

import * as configFns from "../../helpers/configFns";

import * as licencesDB_getOrganization from "../../helpers/licencesDB/getOrganization";
import * as licencesDB_getLicence from "../../helpers/licencesDB/getLicence";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const convertHTMLToPDF = require("pdf-puppeteer");


export const handler: RequestHandler = (req, res, next) => {

  const licenceID = parseInt(req.params.licenceID, 10);

  const licence = licencesDB_getLicence.getLicence(licenceID, req.session);

  if (!licence) {

    res.redirect("/licences/?error=licenceNotFound");
    return;

  }

  if (!licence.issueDate) {

    res.redirect("/licences/?error=licenceNotIssued");
    return;

  }

  const organization = licencesDB_getOrganization.getOrganization(licence.organizationID, req.session);

  ejs.renderFile(
    path.join(__dirname, "../../reports/", configFns.getProperty("licences.printTemplate")), {
      configFns,
      licence,
      organization
    }, {},
    (ejsErr, ejsData) => {

      if (ejsErr) {
        return next(ejsErr);
      }

      convertHTMLToPDF(ejsData, (pdf) => {

        res.setHeader("Content-Disposition",
          "attachment;" +
          " filename=licence-" + licenceID.toString() + "-" + licence.recordUpdate_timeMillis.toString() + ".pdf"
        );

        res.setHeader("Content-Type", "application/pdf");

        res.send(pdf);

      }, {
          format: "Letter",
          printBackground: true,
          preferCSSPageSize: true
        });

      return null;
    }
  );
};
