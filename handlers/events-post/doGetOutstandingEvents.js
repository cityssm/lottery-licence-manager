"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getOutstandingEvents_1 = require("../../helpers/licencesDB/getOutstandingEvents");
const handler = (req, res) => {
    const events = getOutstandingEvents_1.getOutstandingEvents(req.body, req.session);
    res.json(events);
};
exports.handler = handler;
