import { getLicenceType } from '../../helpers/functions.config.js';
export default function handler(request, response) {
    const licenceTypeKey = request.body.licenceTypeKey;
    const licenceType = getLicenceType(licenceTypeKey);
    if (licenceType === undefined) {
        response.json([]);
    }
    else {
        response.json(licenceType.ticketTypes ?? []);
    }
}
