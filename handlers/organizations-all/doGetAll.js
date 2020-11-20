"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getOrganizations_1 = require("../../helpers/licencesDB/getOrganizations");
const handler = (req, res) => {
    res.json(getOrganizations_1.getOrganizations({}, req.session, {
        limit: -1
    }));
};
exports.handler = handler;
