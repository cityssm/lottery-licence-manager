import * as licencesDB from '../../helpers/licencesDB.js';
export default function handler(_request, response) {
    const eventTableStats = licencesDB.getEventTableStats();
    response.render('event-search', {
        headTitle: 'Lottery Events',
        eventTableStats
    });
}
