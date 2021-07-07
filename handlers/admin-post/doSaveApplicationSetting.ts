import type { RequestHandler } from "express";

import { updateApplicationSetting } from "../../helpers/licencesDB/updateApplicationSetting.js";


export const handler: RequestHandler = (request, response) => {

  const settingKey = request.body.settingKey;
  const settingValue = request.body.settingValue;

  const success = updateApplicationSetting(settingKey, settingValue, request.session);

  response.json({
    success
  });
};


export default handler;
