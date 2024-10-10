import { dateToInteger } from '@cityssm/expressjs-server-js/dateTimeFns.js';
import { getProperty } from '../../helpers/functions.config.js';
export default function handler(_request, response) {
    response.render('location-edit', {
        headTitle: 'Create a New Location',
        location: {
            locationCity: getProperty('defaults.city'),
            locationProvince: getProperty('defaults.province')
        },
        currentDateInteger: dateToInteger(new Date()),
        isCreate: true
    });
}
