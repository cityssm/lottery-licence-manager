import * as configFunctions from '../../helpers/functions.config.js';
export default function handler(request, response) {
    const licenceTypeKey = request.body.licenceTypeKey;
    const licenceType = configFunctions.getLicenceType(licenceTypeKey);
    if (licenceType === undefined) {
        response.json([]);
    }
    else {
        response.json(licenceType.ticketTypes ?? []);
    }
}
