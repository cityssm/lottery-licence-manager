import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getLicences: (reqBodyOrParamsObj: {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationID?: string | number;
    organizationName?: string;
    licenceStatus?: "past" | "active";
    locationID?: number;
    locationName?: string;
}, reqSession: expressSession.Session, includeOptions: {
    includeOrganization: boolean;
    limit: number;
    offset?: number;
}) => {
    count: number;
    licences: llm.LotteryLicence[];
};
