import type { RequestHandler } from "express";

import * as licencesDB_updateApplicationSetting from "../../helpers/licencesDB/updateApplicationSetting";


export const handler: RequestHandler = (req, res) => {

  const settingKey = req.body.settingKey;
  const settingValue = req.body.settingValue;

  const success = licencesDB_updateApplicationSetting.updateApplicationSetting(settingKey, settingValue, req.session);

  res.json({
    success
  });
};
