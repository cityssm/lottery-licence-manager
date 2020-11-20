"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateApplicationSetting_1 = require("../../helpers/licencesDB/updateApplicationSetting");
const handler = (req, res) => {
    const settingKey = req.body.settingKey;
    const settingValue = req.body.settingValue;
    const success = updateApplicationSetting_1.updateApplicationSetting(settingKey, settingValue, req.session);
    res.json({
        success
    });
};
exports.handler = handler;
