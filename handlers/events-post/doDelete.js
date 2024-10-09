import deleteEvent from '../../helpers/licencesDB/deleteEvent.js';
export default function handler(request, response) {
    if (request.body.licenceID === '' || request.body.eventDate === '') {
        response.json({
            success: false,
            message: 'Licence ID or Event Date Unavailable'
        });
        return;
    }
    const madeChanges = deleteEvent(request.body.licenceID, request.body.eventDate, request.session);
    if (madeChanges) {
        response.json({
            success: true,
            message: 'Event Deleted'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Event Not Deleted'
        });
    }
}
