import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import * as licencesDB from '../../helpers/licencesDB.js';
export default function handler(_request, response) {
    const licenceTableStats = licencesDB.getLicenceTableStats();
    const startDate = new Date();
    startDate.setDate(1);
    const startDateStartString = dateTimeFns.dateToString(startDate);
    startDate.setMonth(startDate.getMonth() + 1);
    startDate.setDate(0);
    const startDateEndString = dateTimeFns.dateToString(startDate);
    response.render('licence-activeSummary', {
        headTitle: 'Active Licence Summary',
        startYearMin: licenceTableStats.startYearMin || new Date().getFullYear(),
        startDateStartString,
        startDateEndString
    });
}
