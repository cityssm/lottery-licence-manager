"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const pokeLicence_1 = require("../../helpers/licencesDB/pokeLicence");
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
const handler = (req, res, next) => {
    const licenceID = Number(req.params.licenceID);
    if (isNaN(licenceID)) {
        return next();
    }
    pokeLicence_1.pokeLicence(licenceID, req.session);
    return res.redirect(urlPrefix + "/licences/" + licenceID.toString());
};
exports.handler = handler;
