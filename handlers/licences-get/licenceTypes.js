import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import { getLicenceTableStats } from '../../helpers/licencesDB.js';
export default function handler(_request, response) {
    const licenceTableStats = getLicenceTableStats();
    const applicationDate = new Date();
    applicationDate.setMonth(applicationDate.getMonth() - 1);
    applicationDate.setDate(1);
    const applicationDateStartString = dateTimeFns.dateToString(applicationDate);
    applicationDate.setMonth(applicationDate.getMonth() + 1);
    applicationDate.setDate(0);
    const applicationDateEndString = dateTimeFns.dateToString(applicationDate);
    response.render('licence-licenceType', {
        headTitle: 'Licence Type Summary',
        applicationYearMin: licenceTableStats.applicationYearMin || new Date().getFullYear(),
        applicationDateStartString,
        applicationDateEndString
    });
}
