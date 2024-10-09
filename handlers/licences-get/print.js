import path from 'node:path';
import { convertHTMLToPDF } from '@cityssm/pdf-puppeteer';
import * as ejs from 'ejs';
import * as configFunctions from '../../helpers/functions.config.js';
import getLicence from '../../helpers/licencesDB/getLicence.js';
import { getLicenceTicketTypeSummary } from '../../helpers/licencesDB/getLicenceTicketTypeSummary.js';
import getOrganization from '../../helpers/licencesDB/getOrganization.js';
const urlPrefix = configFunctions.getProperty('reverseProxy.urlPrefix');
const printTemplate = configFunctions.getProperty('licences.printTemplate');
export async function handler(request, response, next) {
    const licenceID = Number(request.params.licenceID);
    if (Number.isNaN(licenceID)) {
        next();
        return;
    }
    const licence = getLicence(licenceID, request.session);
    if (licence === undefined) {
        response.redirect(`${urlPrefix}/licences/?error=licenceNotFound`);
        return;
    }
    else if (!licence.issueDate) {
        response.redirect(`${urlPrefix}/licences/?error=licenceNotIssued`);
        return;
    }
    let licenceTicketTypeSummary = [];
    if (licence.licenceTicketTypes && licence.licenceTicketTypes.length > 0) {
        licenceTicketTypeSummary = getLicenceTicketTypeSummary(licenceID);
    }
    const organization = getOrganization(licence.organizationID, request.session);
    const reportPath = path.join('reports', printTemplate);
    const ejsData = await ejs.renderFile(reportPath, {
        configFunctions,
        licence,
        licenceTicketTypeSummary,
        organization
    }, { async: true });
    const pdf = await convertHTMLToPDF(ejsData, {
        format: 'letter',
        printBackground: true,
        preferCSSPageSize: true
    });
    response.setHeader('Content-Disposition', `attachment; filename=licence-${licenceID.toString()}-${licence.recordUpdate_timeMillis.toString()}.pdf`);
    response.setHeader('Content-Type', 'application/pdf');
    response.send(Buffer.from(pdf));
}
export default handler;
