"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const pokeEvent_1 = require("../../helpers/licencesDB/pokeEvent");
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
const handler = (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    const eventDate = parseInt(req.params.eventDate, 10);
    pokeEvent_1.pokeEvent(licenceID, eventDate, req.session);
    res.redirect(urlPrefix + "/events/" + licenceID.toString() + "/" + eventDate.toString());
};
exports.handler = handler;
