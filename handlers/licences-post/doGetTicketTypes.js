import * as configFns from "../../helpers/configFns.js";
export const handler = (request, response) => {
    const licenceTypeKey = request.body.licenceTypeKey;
    const licenceType = configFns.getLicenceType(licenceTypeKey);
    if (licenceType) {
        response.json(licenceType.ticketTypes || []);
    }
    else {
        response.json([]);
    }
};
export default handler;
