"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const pokeLicence_1 = require("../../helpers/licencesDB/pokeLicence");
const handler = (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    pokeLicence_1.pokeLicence(licenceID, req.session);
    res.redirect("/licences/" + licenceID.toString());
};
exports.handler = handler;
