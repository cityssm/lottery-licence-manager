import type { CountryCode } from 'libphonenumber-js';
import type * as configTypes from '../types/configTypes';
import type * as recordTypes from '../types/recordTypes';
export declare function getProperty(propertyName: 'activeDirectory'): configTypes.ConfigActiveDirectory;
export declare function getProperty(propertyName: 'amendments.displayCount'): number;
export declare function getProperty(propertyName: 'amendments.trackLicenceFeeUpdate'): boolean;
export declare function getProperty(propertyName: 'amendments.trackDateTimeUpdate'): boolean;
export declare function getProperty(propertyName: 'amendments.trackOrganizationUpdate'): boolean;
export declare function getProperty(propertyName: 'amendments.trackLocationUpdate'): boolean;
export declare function getProperty(propertyName: 'amendments.trackTicketTypeNew'): boolean;
export declare function getProperty(propertyName: 'amendments.trackTicketTypeUpdate'): boolean;
export declare function getProperty(propertyName: 'amendments.trackTicketTypeDelete'): boolean;
export declare function getProperty(propertyName: 'application.applicationName'): string;
export declare function getProperty(propertyName: 'application.logoURL'): string;
export declare function getProperty(propertyName: 'application.httpPort'): number;
export declare function getProperty(propertyName: 'application.userDomain'): string;
export declare function getProperty(propertyName: 'application.useTestDatabases'): boolean;
export declare function getProperty(propertyName: 'bankRecordTypes'): configTypes.ConfigBankRecordType[];
export declare function getProperty(propertyName: 'defaults.city'): string;
export declare function getProperty(propertyName: 'defaults.province'): string;
export declare function getProperty(propertyName: 'defaults.countryCode'): CountryCode;
export declare function getProperty(propertyName: 'reminders.preferredSortOrder'): 'date' | 'config';
export declare function getProperty(propertyName: 'reminders.dismissingStatuses'): string[];
export declare function getProperty(propertyName: 'licences.externalLicenceNumber.fieldLabel'): string;
export declare function getProperty(propertyName: 'licences.externalLicenceNumber.newCalculation'): '' | 'range';
export declare function getProperty(propertyName: 'licences.externalLicenceNumber.isPreferredID'): boolean;
export declare function getProperty(propertyName: 'licences.externalReceiptNumber.fieldLabel'): string;
export declare function getProperty(propertyName: 'licences.feeCalculationFn'): (licenceObject: recordTypes.LotteryLicence) => {
    fee: number;
    message: string;
    licenceHasErrors: boolean;
};
export declare function getProperty(propertyName: 'licences.printTemplate'): string;
export declare function getProperty(propertyName: 'licenceTypes'): configTypes.ConfigLicenceType[];
export declare function getProperty(propertyName: 'reminderCategories'): configTypes.ConfigReminderCategory[];
export declare function getProperty(propertyName: 'reverseProxy.disableCompression'): boolean;
export declare function getProperty(propertyName: 'reverseProxy.disableEtag'): boolean;
export declare function getProperty(propertyName: 'reverseProxy.urlPrefix'): string;
export declare function getProperty(propertyName: 'session.cookieName'): string;
export declare function getProperty(propertyName: 'session.doKeepAlive'): boolean;
export declare function getProperty(propertyName: 'session.maxAgeMillis'): number;
export declare function getProperty(propertyName: 'session.secret'): string;
export declare function getProperty(propertyName: 'user.createUpdateWindowMillis'): number;
export declare function getProperty(propertyName: 'users.testing'): string[];
export declare function getProperty(propertyName: 'users.canLogin'): string[];
export declare function getProperty(propertyName: 'users.canCreate'): string[];
export declare function getProperty(propertyName: 'users.canUpdate'): string[];
export declare function getProperty(propertyName: 'users.isAdmin'): string[];
export declare function getProperty(propertyName: 'user.defaultProperties'): recordTypes.UserProperties;
export declare const keepAliveMillis: number;
export declare function getReminderType(reminderTypeKey: string): configTypes.ConfigReminderType;
export declare function getLicenceType(licenceTypeKey: string): configTypes.ConfigLicenceType | undefined;
export declare function getLicenceTypeKeyToNameObject(): Record<string, string>;
