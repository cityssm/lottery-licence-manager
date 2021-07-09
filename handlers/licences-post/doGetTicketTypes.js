import * as configFunctions from "../../helpers/functions.config.js";
export const handler = (request, response) => {
    const licenceTypeKey = request.body.licenceTypeKey;
    const licenceType = configFunctions.getLicenceType(licenceTypeKey);
    if (licenceType) {
        response.json(licenceType.ticketTypes || []);
    }
    else {
        response.json([]);
    }
};
export default handler;
