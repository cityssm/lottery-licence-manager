import createLocation from '../../helpers/licencesDB/createLocation.js';
export default function handler(request, response) {
    const locationID = createLocation(request.body, request.session.user);
    response.json({
        success: true,
        locationID,
        locationDisplayName: request.body.locationName === ''
            ? request.body.locationAddress1
            : request.body.locationName
    });
}
