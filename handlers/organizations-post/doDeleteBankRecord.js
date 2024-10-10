import deleteOrganizationBankRecord from '../../helpers/licencesDB/deleteOrganizationBankRecord.js';
export default function handler(request, response) {
    const success = deleteOrganizationBankRecord(request.body.organizationID, request.body.recordIndex, request.session.user);
    if (success) {
        response.json({
            success: true,
            message: 'Organization updated successfully.'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Record Not Saved'
        });
    }
}
