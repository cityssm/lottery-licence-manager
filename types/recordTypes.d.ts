export interface Record {
    recordType: "location" | "organization" | "remark" | "reminder" | "bankRecord" | "licence" | "event";
    success?: true;
    recordCreate_userName: string;
    recordCreate_timeMillis: number;
    recordCreate_dateString?: string;
    recordUpdate_userName: string;
    recordUpdate_timeMillis: number;
    recordUpdate_dateString?: string;
    recordUpdate_timeString?: string;
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
export interface OrganizationRepresentative {
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
    representativePhoneNumber2: string;
    representativeEmailAddress: string;
    isDefault: boolean | string;
}
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
export interface OrganizationReminder extends Record {
    recordType: "reminder";
    organizationID: number;
    organizationName?: string;
    reminderIndex: number;
    reminderTypeKey: string;
    reminderDate: number;
    reminderDateString: string;
    dismissedDate: number;
    dismissedDateString: string;
    reminderStatus: string;
    reminderNote: string;
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
    transactionDateString?: string;
    transactionTime: number;
    transactionTimeString?: string;
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
