import type { RequestHandler } from "express";

import path from "path";
import * as ejs from "ejs";

import * as configFunctions from "../../helpers/functions.config.js";

import { getOrganization } from "../../helpers/licencesDB/getOrganization.js";
import { getLicence } from "../../helpers/licencesDB/getLicence.js";

import convertHTMLToPDF from "pdf-puppeteer";


const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");
const printTemplate = configFunctions.getProperty("licences.printTemplate");
const __dirname = ".";


export const handler: RequestHandler = async(request, response, next) => {

  const licenceID = Number(request.params.licenceID);

  if (Number.isNaN(licenceID)) {
    return next();
  }

  const licence = getLicence(licenceID, request.session);

  if (!licence) {
    return response.redirect(urlPrefix + "/licences/?error=licenceNotFound");

  } else if (!licence.issueDate) {
    return response.redirect(urlPrefix + "/licences/?error=licenceNotIssued");
  }

  const organization = getOrganization(licence.organizationID, request.session);

  const reportPath = path.join(__dirname, "reports", printTemplate);

  const pdfCallbackFunction = (pdf: Buffer) => {

    response.setHeader("Content-Disposition",
      "attachment;" +
      " filename=licence-" + licenceID.toString() + "-" + licence.recordUpdate_timeMillis.toString() + ".pdf"
    );

    response.setHeader("Content-Type", "application/pdf");

    response.send(pdf);
  };

  await ejs.renderFile(
    reportPath, {
      configFunctions,
      licence,
      organization
    }, {},
    async(ejsError, ejsData) => {

      if (ejsError) {
        return next(ejsError);
      }

      await convertHTMLToPDF(ejsData, pdfCallbackFunction, {
        format: "letter",
        printBackground: true,
        preferCSSPageSize: true
      });

      return;
    }
  );
};


export default handler;
