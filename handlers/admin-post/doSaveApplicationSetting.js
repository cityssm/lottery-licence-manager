import { updateApplicationSetting } from '../../helpers/licencesDB/updateApplicationSetting.js';
export default function handler(request, response) {
    const settingKey = request.body.settingKey;
    const settingValue = request.body.settingValue;
    const success = updateApplicationSetting(settingKey, settingValue, request.session);
    response.json({
        success
    });
}
