import issueLicence from '../../helpers/licencesDB/issueLicence.js';
export default function handler(request, response) {
    const success = issueLicence(request.body.licenceID, request.session.user);
    if (success) {
        response.json({
            success: true,
            message: 'Licence Issued Successfully'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Licence Not Issued'
        });
    }
}
