import updateEvent from '../../helpers/licencesDB/updateEvent.js';
export default function handler(request, response) {
    const changeCount = updateEvent(request.body, request.session);
    if (changeCount) {
        response.json({
            success: true,
            message: 'Event updated successfully.'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Record Not Saved'
        });
    }
}
