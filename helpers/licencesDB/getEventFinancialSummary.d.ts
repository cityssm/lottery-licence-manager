export interface EventFinancialSummary {
    licenceTypeKey: string;
    licenceCount: number;
    eventCount: number;
    reportDateCount: number;
    licenceFeeSum: number;
}
export default function getEventFinancialSummary(requestBody: {
    eventDateStartString: string;
    eventDateEndString: string;
}): EventFinancialSummary[];
