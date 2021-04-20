import * as configFns from "../../helpers/configFns.js";
import { pokeLicence } from "../../helpers/licencesDB/pokeLicence.js";
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
export const handler = (req, res, next) => {
    const licenceID = Number(req.params.licenceID);
    if (isNaN(licenceID)) {
        return next();
    }
    pokeLicence(licenceID, req.session);
    return res.redirect(urlPrefix + "/licences/" + licenceID.toString());
};
export default handler;
