"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_mergeLocations = require("../../helpers/licencesDB/mergeLocations");
exports.handler = (req, res) => {
    const targetLocationID = req.body.targetLocationID;
    const sourceLocationID = req.body.sourceLocationID;
    const success = licencesDB_mergeLocations.mergeLocations(targetLocationID, sourceLocationID, req.session);
    res.json({
        success
    });
};
