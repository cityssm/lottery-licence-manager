import { Config_LicenceType } from "../helpers/llmTypes";
declare function getProperty(propertyName: string): any;
export declare const configFns: {
    getProperty: typeof getProperty;
    getLicenceType: (licenceTypeKey: string) => Config_LicenceType;
    config: {};
    getUID: () => string;
};
export {};
