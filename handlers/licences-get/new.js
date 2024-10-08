import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import * as configFunctions from '../../helpers/functions.config.js';
import getNextExternalLicenceNumberFromRange from '../../helpers/licencesDB/getNextExternalLicenceNumberFromRange.js';
import getOrganization from '../../helpers/licencesDB/getOrganization.js';
export default function handler(request, response) {
    const organizationID = Number(request.params.organizationID);
    let organization;
    if (!Number.isNaN(organizationID)) {
        organization = getOrganization(organizationID, request.session.user);
        if (organization !== undefined && !organization.isEligibleForLicences) {
            organization = undefined;
        }
    }
    const currentDateAsString = dateTimeFns.dateToString(new Date());
    let externalLicenceNumber = '';
    const licenceNumberCalculationType = configFunctions.getProperty('licences.externalLicenceNumber.newCalculation');
    if (licenceNumberCalculationType === 'range') {
        externalLicenceNumber = getNextExternalLicenceNumberFromRange().toString();
    }
    response.render('licence-edit', {
        headTitle: 'Licence Create',
        isCreate: true,
        licence: {
            externalLicenceNumber,
            applicationDateString: currentDateAsString,
            municipality: configFunctions.getProperty('defaults.city'),
            startDateString: currentDateAsString,
            endDateString: currentDateAsString,
            startTimeString: '00:00',
            endTimeString: '00:00',
            licenceDetails: '',
            termsConditions: '',
            licenceTicketTypes: [],
            events: []
        },
        organization
    });
}
