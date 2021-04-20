import { getEventFinancialSummary } from "../../helpers/licencesDB/getEventFinancialSummary.js";
export const handler = (req, res) => {
    const summary = getEventFinancialSummary(req.body);
    res.json(summary);
};
export default handler;
