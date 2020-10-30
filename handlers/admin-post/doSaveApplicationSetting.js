"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_updateApplicationSetting = require("../../helpers/licencesDB/updateApplicationSetting");
exports.handler = (req, res) => {
    const settingKey = req.body.settingKey;
    const settingValue = req.body.settingValue;
    const success = licencesDB_updateApplicationSetting.updateApplicationSetting(settingKey, settingValue, req.session);
    res.json({
        success
    });
};
