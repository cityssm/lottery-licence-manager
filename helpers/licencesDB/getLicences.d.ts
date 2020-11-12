import type * as llm from "../../types/recordTypes";
export declare const getLicences: (reqBodyOrParamsObj: {
    externalLicenceNumber?: string;
    licenceTypeKey?: string;
    organizationID?: string | number;
    organizationName?: string;
    licenceStatus?: string;
    locationID?: number;
    locationName?: string;
}, reqSession: any, includeOptions: {
    includeOrganization: boolean;
    limit: number;
    offset?: number;
}) => {
    count: number;
    licences: llm.LotteryLicence[];
};
