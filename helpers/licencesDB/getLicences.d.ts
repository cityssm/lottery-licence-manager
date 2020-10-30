/// <reference types="csurf" />
/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-rate-limit" />
/// <reference types="express-session" />
import type * as llm from "../../types/recordTypes";
export declare const getLicences: (reqBodyOrParamsObj: {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationID?: string | number;
    organizationName?: string;
    licenceStatus?: string;
    locationID?: number;
    locationName?: string;
}, reqSession: Express.SessionData, includeOptions: {
    includeOrganization: boolean;
    limit: number;
    offset?: number;
}) => {
    count: number;
    licences: llm.LotteryLicence[];
};
