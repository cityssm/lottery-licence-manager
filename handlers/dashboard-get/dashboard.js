import * as configFunctions from '../../helpers/functions.config.js';
import getApplicationSetting from '../../helpers/licencesDB/getApplicationSetting.js';
import getDashboardStats from '../../helpers/licencesDB/getDashboardStats.js';
import getNextExternalLicenceNumberFromRange from '../../helpers/licencesDB/getNextExternalLicenceNumberFromRange.js';
export default function handler(_request, response) {
    const stats = getDashboardStats();
    let dashboardWarningMessage = '';
    if (configFunctions.getProperty('licences.externalLicenceNumber.newCalculation') === 'range') {
        const rangeEnd = Number.parseInt(getApplicationSetting('licences.externalLicenceNumber.range.end') || '0', 10);
        if (rangeEnd !== 0) {
            const nextExternalLicenceNumber = getNextExternalLicenceNumberFromRange();
            if (nextExternalLicenceNumber === -1 ||
                rangeEnd - nextExternalLicenceNumber <= 50) {
                dashboardWarningMessage =
                    'There are less than 50 remaining licence numbers left in the current range.';
            }
        }
    }
    response.render('dashboard', {
        headTitle: 'Dashboard',
        stats,
        dashboardWarningMessage
    });
}
