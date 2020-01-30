declare type LicenceType = {
    licenceTypeKey: string;
    licenceType: string;
};
declare function getProperty(propertyName: string): any;
declare const configFns: {
    getProperty: typeof getProperty;
    getLicenceType: (licenceTypeKey: string) => LicenceType;
    config: {};
    getUID: () => string;
};
export = configFns;
