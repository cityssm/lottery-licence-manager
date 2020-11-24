import type { RequestHandler } from "express";

import * as path from "path";
import * as ejs from "ejs";

import * as configFns from "../../helpers/configFns";

import * as licencesDB_getOrganization from "../../helpers/licencesDB/getOrganization";
import * as licencesDB_getLicence from "../../helpers/licencesDB/getLicence";

import convertHTMLToPDF = require("pdf-puppeteer");


export const handler: RequestHandler = async(req, res, next) => {

  const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");

  const licenceID = parseInt(req.params.licenceID, 10);

  const licence = licencesDB_getLicence.getLicence(licenceID, req.session);

  if (!licence) {

    res.redirect(urlPrefix + "/licences/?error=licenceNotFound");
    return;

  }

  if (!licence.issueDate) {

    res.redirect(urlPrefix + "/licences/?error=licenceNotIssued");
    return;

  }

  const organization = licencesDB_getOrganization.getOrganization(licence.organizationID, req.session);

  await ejs.renderFile(
    path.join(__dirname, "../../reports/", configFns.getProperty("licences.printTemplate")), {
      configFns,
      licence,
      organization
    }, {},
    async(ejsErr, ejsData) => {

      if (ejsErr) {
        return next(ejsErr);
      }

      const pdfCallbackFn = (pdf: Buffer) => {

        res.setHeader("Content-Disposition",
          "attachment;" +
          " filename=licence-" + licenceID.toString() + "-" + licence.recordUpdate_timeMillis.toString() + ".pdf"
        );

        res.setHeader("Content-Type", "application/pdf");

        res.send(pdf);

      };

      await convertHTMLToPDF(ejsData, pdfCallbackFn, {
        format: "Letter",
        printBackground: true,
        preferCSSPageSize: true
      });

      return null;
    }
  );
};
