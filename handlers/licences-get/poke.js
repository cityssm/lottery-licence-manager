import { getProperty } from '../../helpers/functions.config.js';
import pokeLicence from '../../helpers/licencesDB/pokeLicence.js';
const urlPrefix = getProperty('reverseProxy.urlPrefix');
export default function handler(request, response, next) {
    const licenceID = Number(request.params.licenceID);
    if (Number.isNaN(licenceID)) {
        next();
        return;
    }
    pokeLicence(licenceID, request.session.user);
    response.redirect(`${urlPrefix}/licences/${licenceID.toString()}`);
}
