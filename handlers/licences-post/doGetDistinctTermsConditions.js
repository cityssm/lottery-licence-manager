import getDistinctTermsConditions from '../../helpers/licencesDB/getDistinctTermsConditions.js';
export default function handler(request, response) {
    const organizationID = request.body.organizationID;
    response.json(getDistinctTermsConditions(organizationID));
}
