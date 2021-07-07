import type { LotteryLicence } from "./recordTypes";
import type * as expressTypes from "express";
export interface Config {
    application?: ConfigApplication;
    session?: ConfigSession;
    reverseProxy?: {
        disableCompression: boolean;
        disableEtag: boolean;
        urlPrefix: string;
    };
    admin?: ConfigAdmin;
    user?: ConfigUser;
    defaults?: ConfigDefaults;
    reminders?: {
        preferredSortOrder?: "date" | "config";
        dismissingStatuses?: string[];
    };
    reminderCategories?: ConfigReminderCategory[];
    bankRecordTypes?: ConfigBankRecordType[];
    licences?: ConfigLicences;
    licenceTypes?: ConfigLicenceType[];
    amendments?: ConfigAmendments;
}
interface ConfigApplication {
    applicationName?: string;
    logoURL?: string;
    httpPort?: number;
    https?: ConfigHTTPS;
}
export interface ConfigHTTPS {
    port: number;
    keyPath: string;
    certPath: string;
    passphrase?: string;
}
interface ConfigSession {
    cookieName?: string;
    secret?: string;
    maxAgeMillis?: number;
    doKeepAlive?: boolean;
}
interface ConfigAdmin {
    defaultPassword?: string;
}
interface ConfigUser {
    createUpdateWindowMillis: number;
    defaultProperties: {
        canCreate: boolean;
        canUpdate: boolean;
        isAdmin: boolean;
    };
}
interface ConfigDefaults {
    city: string;
    province: string;
}
export interface ConfigReminderCategory {
    reminderCategory: string;
    categoryDescription?: string;
    isActive: boolean;
    reminderTypes: ConfigReminderType[];
}
export interface ConfigReminderType {
    reminderTypeKey: string;
    reminderCategory?: string;
    reminderType: string;
    reminderStatuses?: string[];
    hasUndismissedLimit: boolean;
    isBasedOnFiscalYear: boolean;
    isActive: boolean;
}
export interface ConfigBankRecordType {
    bankRecordType: string;
    bankRecordTypeName: string;
}
interface ConfigLicences {
    feeCalculationFn: (licenceObject: LotteryLicence) => {
        fee: string | number;
        message: string;
        licenceHasErrors: boolean;
    };
    printTemplate: string;
    externalLicenceNumber?: ConfigExternalLicenceNumber;
    externalReceiptNumber?: ConfigExternalReceiptNumber;
}
interface ConfigExternalLicenceNumber {
    fieldLabel?: string;
    newCalculation?: "" | "range";
    isPreferredID?: boolean;
}
interface ConfigExternalReceiptNumber {
    fieldLabel: string;
}
export interface ConfigLicenceType {
    licenceTypeKey: string;
    licenceType: string;
    totalPrizeValueMax: number;
    isActive: boolean;
    licenceFields: ConfigLicenceField[];
    eventFields: ConfigEventField[];
    ticketTypes?: ConfigTicketType[];
    printSettings?: Record<string, unknown>;
}
interface ConfigLicenceField {
    fieldKey: string;
    fieldLabel: string;
    isActive: boolean;
    isShownOnEvent: boolean;
    inputAttributes: ConfigFieldInputAttributes;
}
interface ConfigEventField {
    fieldKey: string;
    fieldLabel: string;
    isActive: boolean;
    inputAttributes: ConfigFieldInputAttributes;
}
interface ConfigFieldInputAttributes {
    type: "number" | "text";
    min?: number;
    max?: number;
    step?: number;
    maxlength?: number;
}
export interface ConfigTicketType {
    ticketType: string;
    ticketPrice: number;
    ticketCount: number;
    prizesPerDeal: number;
    feePerUnit?: number;
}
interface ConfigAmendments {
    displayCount: number;
    trackLicenceFeeUpdate: boolean;
    trackDateTimeUpdate: boolean;
    trackOrganizationUpdate: boolean;
    trackLocationUpdate: boolean;
    trackTicketTypeNew: boolean;
    trackTicketTypeUpdate: boolean;
    trackTicketTypeDelete: boolean;
}
export interface ConfigReportDefinition {
    sql: string;
    params?: (request: expressTypes.Request) => unknown[];
    functions?: () => Map<string, (...parameters: unknown[]) => unknown>;
}
export {};
