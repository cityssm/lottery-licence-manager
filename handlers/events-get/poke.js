"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_pokeEvent = require("../../helpers/licencesDB/pokeEvent");
exports.handler = (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    const eventDate = parseInt(req.params.eventDate, 10);
    licencesDB_pokeEvent.pokeEvent(licenceID, eventDate, req.session);
    res.redirect("/events/" + licenceID.toString() + "/" + eventDate.toString());
};
