import unissueLicence from '../../helpers/licencesDB/unissueLicence.js';
export default function handler(request, response) {
    const success = unissueLicence(request.body.licenceID, request.session);
    if (success) {
        response.json({
            success: true,
            message: 'Licence Unissued Successfully'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Licence Not Unissued'
        });
    }
}
