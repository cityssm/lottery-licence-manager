"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const deleteEvent_1 = require("../../helpers/licencesDB/deleteEvent");
const handler = (req, res) => {
    if (req.body.licenceID === "" || req.body.eventDate === "") {
        res.json({
            success: false,
            message: "Licence ID or Event Date Unavailable"
        });
    }
    else {
        const changeCount = deleteEvent_1.deleteEvent(req.body.licenceID, req.body.eventDate, req.session);
        if (changeCount) {
            res.json({
                success: true,
                message: "Event Deleted"
            });
        }
        else {
            res.json({
                success: false,
                message: "Event Not Deleted"
            });
        }
    }
};
exports.handler = handler;
