import { getEventFinancialSummary } from "../../helpers/licencesDB/getEventFinancialSummary.js";
export const handler = (request, response) => {
    const summary = getEventFinancialSummary(request.body);
    response.json(summary);
};
export default handler;
