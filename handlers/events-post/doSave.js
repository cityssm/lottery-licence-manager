"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateEvent_1 = require("../../helpers/licencesDB/updateEvent");
const handler = (req, res) => {
    const changeCount = updateEvent_1.updateEvent(req.body, req.session);
    if (changeCount) {
        res.json({
            success: true,
            message: "Event updated successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Record Not Saved"
        });
    }
};
exports.handler = handler;
