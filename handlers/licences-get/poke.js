"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_pokeLicence = require("../../helpers/licencesDB/pokeLicence");
exports.handler = (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    licencesDB_pokeLicence.pokeLicence(licenceID, req.session);
    res.redirect("/licences/" + licenceID.toString());
};
