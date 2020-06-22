export interface Config {
    application?: ConfigApplication;
    session?: ConfigSession;
    admin?: ConfigAdmin;
    user?: ConfigUser;
    defaults?: ConfigDefaults;
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
export interface ConfigBankRecordType {
    bankRecordType: "statement" | "cheques" | "receipts";
    bankRecordTypeName: string;
}
interface ConfigLicences {
    feeCalculationFn: (licenceObj: LotteryLicence) => {
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
    printSettings?: {};
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
export interface Record {
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
}
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
    representativeName: string;
    licences_activeCount?: number;
    licences_endDateMax?: number;
    licences_endDateMaxString?: string;
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
    organizationName?: string;
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
    licenceAmendments: LotteryLicenceAmendment[];
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
    transactionIndex: number;
    transactionDate: number;
    transactionTime: number;
    externalReceiptNumber: string;
    transactionAmount: number;
    transactionNote: string;
}
export interface LotteryLicenceAmendment extends Record {
    amendmentIndex: number;
    amendmentDate: number;
    amendmentTime: number;
    amendmentType: string;
    amendment: string;
    isHidden: boolean;
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
export interface FieldData {
    fieldKey: string;
    fieldValue: string;
}
export interface LotteryEventStats {
    eventYearMin: number;
}
export interface LotteryLicenceStats {
    applicationYearMin: number;
    startYearMin: number;
    endYearMax: number;
}
export interface TermsConditionsStat {
    termsConditions: string;
    termsConditionsCount: number;
    startDateMax: number;
    startDateMaxString: string;
}
export interface User {
    userName: string;
    firstName?: string;
    lastName?: string;
    userProperties?: UserProperties;
}
export interface UserProperties {
    isDefaultAdmin: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    isAdmin: boolean;
}
export {};
