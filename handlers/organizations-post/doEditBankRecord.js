import updateOrganizationBankRecord from '../../helpers/licencesDB/updateOrganizationBankRecord.js';
export default function handler(request, response) {
    const success = updateOrganizationBankRecord(request.body, request.session.user);
    if (success) {
        response.json({
            success: true,
            message: 'Record updated successfully.'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Please try again.'
        });
    }
}
