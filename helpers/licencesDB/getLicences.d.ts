import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
interface GetLicencesReturn {
    count: number;
    licences: llm.LotteryLicence[];
}
export declare const getLicences: (requestBodyOrParametersObject: {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationID?: string | number;
    organizationName?: string;
    licenceStatus?: "past" | "active";
    locationID?: number;
    locationName?: string;
}, requestSession: expressSession.Session, includeOptions: {
    includeOrganization: boolean;
    limit: number;
    offset?: number;
}) => GetLicencesReturn;
export {};
