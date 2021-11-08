interface LotteryLicenceTicketTypeSummary {
    ticketType: string;
    distributorLocationID: number;
    distributorLocationDisplayName: string;
    manufacturerLocationID: number;
    manufacturerLocationDisplayName: string;
    unitCountSum: number;
    licenceFeeSum: number;
}
export declare const getLicenceTicketTypeSummary: (licenceID: number | string) => LotteryLicenceTicketTypeSummary[];
export {};
