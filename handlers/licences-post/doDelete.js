import deleteLicence from '../../helpers/licencesDB/deleteLicence.js';
export default function handler(request, response) {
    if (request.body.licenceID === '') {
        response.json({
            success: false,
            message: 'Licence ID Unavailable'
        });
    }
    else {
        const changeCount = deleteLicence(request.body.licenceID, request.session);
        if (changeCount) {
            response.json({
                success: true,
                message: 'Licence Deleted'
            });
        }
        else {
            response.json({
                success: false,
                message: 'Licence Not Deleted'
            });
        }
    }
}
