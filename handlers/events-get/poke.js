"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const pokeEvent_1 = require("../../helpers/licencesDB/pokeEvent");
const handler = (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    const eventDate = parseInt(req.params.eventDate, 10);
    pokeEvent_1.pokeEvent(licenceID, eventDate, req.session);
    res.redirect("/events/" + licenceID.toString() + "/" + eventDate.toString());
};
exports.handler = handler;
