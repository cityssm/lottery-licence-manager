"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getLicences_1 = require("../../helpers/licencesDB/getLicences");
const handler = (req, res) => {
    res.json(getLicences_1.getLicences(req.body, req.session, {
        includeOrganization: true,
        limit: req.body.limit,
        offset: req.body.offset
    }));
};
exports.handler = handler;
