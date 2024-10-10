import addOrganizationBankRecord from '../../helpers/licencesDB/addOrganizationBankRecord.js';
export default function handler(request, response) {
    const success = addOrganizationBankRecord(request.body, request.session.user);
    if (success) {
        response.json({
            success: true,
            message: 'Record added successfully.'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Please make sure that the record you are trying to create does not already exist.'
        });
    }
}
