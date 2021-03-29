"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getEvents_1 = require("../../helpers/licencesDB/getEvents");
const handler = (req, res) => {
    res.json(getEvents_1.getEvents(req.body, req.session));
};
exports.handler = handler;
