import type * as expressSession from "express-session";
export declare const parseTicketTypeKey: (unparsedTicketTypeKey: string) => {
    eventDate: number;
    eventDateString: string;
    ticketType: string;
};
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
export declare const updateLicence: (reqBody: LotteryLicenceForm, reqSession: expressSession.Session) => boolean;
export default updateLicence;
