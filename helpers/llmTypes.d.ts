export declare type Config = {
    application?: Config_ApplicationConfig;
    session?: Config_SessionConfig;
    admin?: Config_AdminDefaults;
    user?: Config_UserConfig;
    defaults?: Config_DefaultsConfig;
    bankRecordTypes?: Config_BankRecordType[];
    licences?: Config_LicencesConfig;
    licenceTypes?: Config_LicenceType[];
    amendments?: Config_AmendmentConfig;
};
declare type Config_ApplicationConfig = {
    applicationName?: string;
    logoURL?: string;
    httpPort?: number;
    https?: Config_HttpsConfig;
};
export declare type Config_HttpsConfig = {
    port: number;
    keyPath: string;
    certPath: string;
    passphrase: string;
};
declare type Config_SessionConfig = {
    cookieName?: string;
    secret?: string;
    maxAgeMillis?: number;
    doKeepAlive?: boolean;
};
declare type Config_AdminDefaults = {
    defaultPassword?: string;
};
declare type Config_UserConfig = {
    createUpdateWindowMillis: number;
    defaultProperties: {
        canCreate: boolean;
        canUpdate: boolean;
        isAdmin: boolean;
    };
};
declare type Config_DefaultsConfig = {
    city: string;
    province: string;
};
export declare type Config_BankRecordType = {
    bankRecordType: "statement" | "cheques" | "receipts";
    bankRecordTypeName: string;
};
declare type Config_LicencesConfig = {
    feeCalculationFn: (licenceObj: LotteryLicence) => {
        fee: string | number;
        message: string;
        licenceHasErrors: boolean;
    };
    printTemplate: string;
    externalLicenceNumber?: Config_ExternalLicenceNumber;
    externalReceiptNumber?: Config_ExternalReceiptNumber;
};
declare type Config_ExternalLicenceNumber = {
    fieldLabel?: string;
    newCalculation?: "" | "range";
    isPreferredID?: boolean;
};
declare type Config_ExternalReceiptNumber = {
    fieldLabel: string;
};
export declare type Config_LicenceType = {
    licenceTypeKey: string;
    licenceType: string;
    totalPrizeValueMax: number;
    isActive: boolean;
    licenceFields: Config_LicenceField[];
    eventFields: Config_EventField[];
    ticketTypes?: Config_TicketType[];
};
declare type Config_LicenceField = {
    fieldKey: string;
    fieldLabel: string;
    isActive: boolean;
    isShownOnEvent: boolean;
    inputAttributes: Config_FieldInputAttributes;
};
declare type Config_EventField = {
    fieldKey: string;
    fieldLabel: string;
    isActive: boolean;
    inputAttributes: Config_FieldInputAttributes;
};
declare type Config_FieldInputAttributes = {
    type: "number" | "text";
    min?: number;
    max?: number;
    step?: number;
    maxlength?: number;
};
export declare type Config_TicketType = {
    ticketType: string;
    ticketPrice: number;
    ticketCount: number;
    prizesPerDeal: number;
    feePerUnit?: number;
};
declare type Config_AmendmentConfig = {
    displayCount: number;
    trackLicenceFeeUpdate: boolean;
    trackDateTimeUpdate: boolean;
    trackOrganizationUpdate: boolean;
    trackLocationUpdate: boolean;
    trackTicketTypeNew: boolean;
    trackTicketTypeUpdate: boolean;
    trackTicketTypeDelete: boolean;
};
export declare type Record = {
    recordType: "location" | "organization" | "remark" | "bankRecord" | "licence" | "event";
    recordCreate_userName: string;
    recordCreate_timeMillis: number;
    recordCreate_dateString: string;
    recordUpdate_userName: string;
    recordUpdate_timeMillis: number;
    recordUpdate_dateString: string;
    recordUpdate_timeString: string;
    recordDelete_userName?: string;
    recordDelete_timeMillis?: number;
    recordDelete_dateString?: string;
    canUpdate: boolean;
};
export interface Location extends Record {
    recordType: "location" | "licence" | "event";
    locationID: number;
    locationDisplayName: string;
    locationName: string;
    locationAddress1: string;
    locationAddress2: string;
    locationCity: string;
    locationProvince: string;
    locationPostalCode: string;
    locationIsDistributor: boolean;
    locationIsManufacturer: boolean;
    licences_count?: number;
    licences_endDateMax: number;
    licences_endDateMaxString: string;
    distributor_count?: number;
    distributor_endDateMax: number;
    distributor_endDateMaxString: string;
    manufacturer_count?: number;
    manufacturer_endDateMax: number;
    manufacturer_endDateMaxString: string;
}
export interface Organization extends Record {
    recordType: "organization";
    organizationID: number;
    organizationName: string;
    organizationAddress1: string;
    organizationAddress2: string;
    organizationCity: string;
    organizationProvince: string;
    organizationPostalCode: string;
    trustAccountNumber: string;
    fiscalStartDate: number;
    fiscalStartDateString: string;
    fiscalEndDate: number;
    fiscalEndDateString: string;
    isEligibleForLicences: boolean;
    organizationNote: string;
    canUpdate: boolean;
    organizationRepresentatives: OrganizationRepresentative[];
    licences_endDateMax: number;
    licences_endDateMaxString: string;
}
export declare type OrganizationRepresentative = {
    organizationID: number;
    representativeIndex: number;
    representativeName: string;
    representativeTitle: string;
    representativeAddress1: string;
    representativeAddress2: string;
    representativeCity: string;
    representativeProvince: string;
    representativePostalCode: string;
    representativePhoneNumber: string;
    representativeEmailAddress: string;
    isDefault: boolean | string;
};
export interface OrganizationRemark extends Record {
    recordType: "remark";
    organizationID: number;
    remarkIndex: number;
    remarkDate: number;
    remarkDateString: string;
    remarkTime: number;
    remarkTimeString: string;
    remark: string;
    isImportant: boolean;
}
export interface OrganizationBankRecord extends Record {
    recordType: "bankRecord";
    organizationID: number;
    recordIndex: number;
    bankingYear: number;
    bankingMonth: number;
    bankRecordType: "statement" | "cheques" | "receipts";
    accountNumber: string;
    recordDate: number;
    recordDateString: string;
    recordNote: string;
    recordIsNA: boolean;
}
export interface LotteryLicence extends Location, Record {
    recordType: "licence" | "event";
    licenceID: number;
    organizationID: number;
    externalLicenceNumber: string;
    externalLicenceNumberInteger: number;
    applicationDate: number;
    applicationDateString: string;
    licenceTypeKey: string;
    licenceType: string;
    startDate: number;
    startDateString: string;
    endDate: number;
    endDateString: string;
    startTime: number;
    startTimeString: string;
    endTime: number;
    endTimeString: string;
    locationID: number;
    municipality: string;
    licenceDetails: string;
    termsConditions: string;
    totalPrizeValue: number;
    licenceFee: number;
    issueDate: number;
    issueDateString: string;
    issueTime: number;
    issueTimeString: string;
    trackUpdatesAsAmendments: boolean;
    licenceTicketTypes: LotteryLicenceTicketType[];
    licenceFields: FieldData[];
    licenceAmendments: LotteryLicenceAmendments[];
    licenceTransactionTotal: number;
    licenceTransactions: LotteryLicenceTransaction[];
    events: LotteryEvent[];
}
export interface LotteryLicenceTicketType extends Record {
    licenceID: number;
    ticketType: string;
    unitCount: number;
}
export interface LotteryLicenceTransaction extends Record {
}
export interface LotteryLicenceAmendments extends Record {
}
export interface LotteryEvent extends LotteryLicence {
    recordType: "event";
    eventDate: number;
    eventDateString: string;
    reportDate: number;
    reportDateString: string;
    bank_name: string;
    bank_name_isOutstanding: boolean;
    bank_address: string;
    bank_accountNumber: string;
    bank_accountBalance: string;
    costs_receipts: number;
    costs_admin: number;
    costs_prizesAwarded: number;
    costs_netProceeds: number;
    costs_amountDonated: number;
    eventFields: FieldData[];
}
export declare type FieldData = {
    fieldKey: string;
    fieldValue: string;
};
export declare type LotteryEventStats = {
    eventYearMin: number;
};
export declare type LotteryLicenceStats = {
    applicationYearMin: number;
    startYearMin: number;
    endYearMax: number;
};
export declare type TermsConditionsStat = {
    termsConditions: string;
    termsConditionsCount: number;
    startDateMax: number;
    startDateMaxString: string;
};
export declare type User = {
    userName: string;
    firstName?: string;
    lastName?: string;
    userProperties?: UserProperties;
};
export declare type UserProperties = {
    isDefaultAdmin: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    isAdmin: boolean;
};
export {};
