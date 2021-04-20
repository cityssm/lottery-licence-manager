import type { RequestHandler } from "express";

import * as path from "path";
import * as ejs from "ejs";

import * as configFns from "../../helpers/configFns.js";

import { getOrganization } from "../../helpers/licencesDB/getOrganization.js";
import { getLicence } from "../../helpers/licencesDB/getLicence.js";

import convertHTMLToPDF from "pdf-puppeteer";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
const printTemplate = configFns.getProperty("licences.printTemplate");


export const handler: RequestHandler = async(req, res, next) => {

  const licenceID = Number(req.params.licenceID);

  if (isNaN(licenceID)) {
    return next();
  }

  const licence = getLicence(licenceID, req.session);

  if (!licence) {
    return res.redirect(urlPrefix + "/licences/?error=licenceNotFound");

  } else if (!licence.issueDate) {
    return res.redirect(urlPrefix + "/licences/?error=licenceNotIssued");
  }

  const organization = getOrganization(licence.organizationID, req.session);

  await ejs.renderFile(
    path.join(__dirname, "../../reports/", printTemplate), {
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
        format: "letter",
        printBackground: true,
        preferCSSPageSize: true
      });

      return null;
    }
  );
};


export default handler;
