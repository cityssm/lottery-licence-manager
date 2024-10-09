import { getEventFinancialSummary } from '../../helpers/licencesDB/getEventFinancialSummary.js';
export default function handler(request, response) {
    const summary = getEventFinancialSummary(request.body);
    response.json(summary);
}
