import deleteLocation from '../../helpers/licencesDB/deleteLocation.js';
export default function handler(request, response) {
    const hasChanges = deleteLocation(request.body.locationID, request.session.user);
    if (hasChanges) {
        response.json({
            success: true,
            message: 'Location deleted successfully.'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Location could not be deleted.'
        });
    }
}
