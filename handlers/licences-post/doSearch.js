"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_getLicences = require("../../helpers/licencesDB/getLicences");
exports.handler = (req, res) => {
    res.json(licencesDB_getLicences.getLicences(req.body, req.session, {
        includeOrganization: true,
        limit: req.body.limit,
        offset: req.body.offset
    }));
};
