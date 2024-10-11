export interface LotteryLicenceTicketTypeSummary {
    ticketType: string;
    distributorLocationID: number;
    distributorLocationDisplayName: string;
    manufacturerLocationID: number;
    manufacturerLocationDisplayName: string;
    unitCountSum: number;
    licenceFeeSum: number;
}
export default function getLicenceTicketTypeSummary(licenceID: number | string): LotteryLicenceTicketTypeSummary[];
