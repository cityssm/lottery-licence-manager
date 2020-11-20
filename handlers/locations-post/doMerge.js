"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const mergeLocations_1 = require("../../helpers/licencesDB/mergeLocations");
const handler = (req, res) => {
    const targetLocationID = req.body.targetLocationID;
    const sourceLocationID = req.body.sourceLocationID;
    const success = mergeLocations_1.mergeLocations(targetLocationID, sourceLocationID, req.session);
    res.json({
        success
    });
};
exports.handler = handler;
