import updateLocation from '../../helpers/licencesDB/updateLocation.js';
export default function handler(request, response) {
    const hasChanges = updateLocation(request.body, request.session.user);
    if (hasChanges) {
        response.json({
            success: true,
            message: 'Location updated successfully.'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Record Not Saved'
        });
    }
}
