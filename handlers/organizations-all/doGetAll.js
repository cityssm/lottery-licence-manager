"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_getOrganizations = require("../../helpers/licencesDB/getOrganizations");
exports.handler = (req, res) => {
    res.json(licencesDB_getOrganizations.getOrganizations({}, req.session, {
        limit: -1
    }));
};
