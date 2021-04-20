import * as configFns from "../../helpers/configFns.js";
export const handler = (req, res) => {
    const licenceTypeKey = req.body.licenceTypeKey;
    const licenceType = configFns.getLicenceType(licenceTypeKey);
    if (licenceType) {
        res.json(licenceType.ticketTypes || []);
    }
    else {
        res.json([]);
    }
};
export default handler;
