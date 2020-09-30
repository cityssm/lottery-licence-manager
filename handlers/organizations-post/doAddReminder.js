"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const addOrganizationReminder_1 = require("../../helpers/licencesDB/addOrganizationReminder");
exports.handler = (req, res) => {
    const reminder = addOrganizationReminder_1.addOrganizationReminder(req.body, req.session);
    if (reminder) {
        return res.json({
            success: true,
            reminder
        });
    }
    else {
        return res.json({
            success: false
        });
    }
};
