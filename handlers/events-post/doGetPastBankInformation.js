import { getPastEventBankingInformation } from "../../helpers/licencesDB/getPastEventBankingInformation.js";
export const handler = (req, res) => {
    const bankInfoList = getPastEventBankingInformation(req.body.licenceID);
    res.json(bankInfoList);
};
