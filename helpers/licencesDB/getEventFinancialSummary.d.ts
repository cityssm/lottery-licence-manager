export interface EventFinancialSummary {
    licenceTypeKey: string;
    licenceCount: number;
    eventCount: number;
    reportDateCount: number;
    licenceFeeSum: number;
}
export declare const getEventFinancialSummary: (reqBody: {
    eventDateStartString: string;
    eventDateEndString: string;
}) => EventFinancialSummary[];
