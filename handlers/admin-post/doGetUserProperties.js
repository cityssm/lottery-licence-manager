import { getUserProperties } from "../../helpers/usersDB/getUserProperties.js";
export const handler = (req, res) => {
    const userProperties = getUserProperties(req.body.userName);
    res.json(userProperties);
};
