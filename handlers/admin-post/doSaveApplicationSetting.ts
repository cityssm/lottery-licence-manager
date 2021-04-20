import type { RequestHandler } from "express";

import { updateApplicationSetting } from "../../helpers/licencesDB/updateApplicationSetting.js";


export const handler: RequestHandler = (req, res) => {

  const settingKey = req.body.settingKey;
  const settingValue = req.body.settingValue;

  const success = updateApplicationSetting(settingKey, settingValue, req.session);

  res.json({
    success
  });
};


export default handler;
