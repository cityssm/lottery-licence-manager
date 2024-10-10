import addOrganizationRemark from '../../helpers/licencesDB/addOrganizationRemark.js';
export default function handler(request, response) {
    const remarkIndex = addOrganizationRemark(request.body, request.session.user);
    response.json({
        success: true,
        message: 'Remark added successfully.',
        remarkIndex
    });
}
