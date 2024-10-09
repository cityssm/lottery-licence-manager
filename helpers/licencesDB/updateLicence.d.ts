import type * as expressSession from 'express-session';
interface ParseTicketTypeKeyReturn {
    eventDate: number;
    eventDateString: string;
    ticketType: string;
}
export declare const parseTicketTypeKey: (unparsedTicketTypeKey: string) => ParseTicketTypeKeyReturn;
export interface LotteryLicenceForm {
    licenceID?: string;
    externalLicenceNumber: string;
    applicationDateString: string;
    organizationID: string;
    municipality: string;
    locationID: string;
    startDateString: string;
    endDateString: string;
    startTimeString: string;
    endTimeString: string;
    licenceDetails: string;
    termsConditions: string;
    licenceTypeKey: string;
    totalPrizeValue: string;
    ticketType_amendmentDateString: string | string[];
    ticketType_ticketType: string | string[];
    ticketType_unitCount: string | string[];
    ticketType_licenceFee: string | string[];
    ticketType_manufacturerLocationID: string | string[];
    ticketType_distributorLocationID: string | string[];
    ticketTypeIndex_toDelete?: string | string[];
    eventDateString: string | string[];
    fieldKeys: string;
    licenceFee?: string;
}
export default function updateLicence(requestBody: LotteryLicenceForm & {
    licenceID: string;
}, requestSession: expressSession.Session): boolean;
export {};
