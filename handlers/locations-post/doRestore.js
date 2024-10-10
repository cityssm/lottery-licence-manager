import restoreLocation from '../../helpers/licencesDB/restoreLocation.js';
export default function handler(request, response) {
    const hasChanges = restoreLocation(request.body.locationID, request.session.user);
    if (hasChanges) {
        response.json({
            success: true,
            message: 'Location restored successfully.'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Location could not be restored.'
        });
    }
}
