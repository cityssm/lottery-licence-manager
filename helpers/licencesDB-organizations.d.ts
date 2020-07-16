/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
import * as llm from "./llmTypes";
export declare const getOrganizations: (reqBody: {
    organizationName?: string;
    representativeName?: string;
    isEligibleForLicences?: string;
    organizationIsActive?: string;
}, reqSession: Express.SessionData, includeOptions: {
    limit: number;
    offset?: number;
}) => llm.Organization[];
export declare const getOrganization: (organizationID: number, reqSession: Express.SessionData) => llm.Organization;
export declare const createOrganization: (reqBody: llm.Organization, reqSession: Express.SessionData) => number;
export declare const updateOrganization: (reqBody: llm.Organization, reqSession: Express.SessionData) => boolean;
export declare const deleteOrganization: (organizationID: number, reqSession: Express.SessionData) => boolean;
export declare const restoreOrganization: (organizationID: number, reqSession: Express.SessionData) => boolean;
export declare const getInactiveOrganizations: (inactiveYears: number) => llm.Organization[];
export declare const getDeletedOrganizations: () => llm.Organization[];
export declare const addOrganizationRepresentative: (organizationID: number, reqBody: llm.OrganizationRepresentative) => llm.OrganizationRepresentative;
export declare const updateOrganizationRepresentative: (organizationID: number, reqBody: llm.OrganizationRepresentative) => llm.OrganizationRepresentative;
export declare const deleteOrganizationRepresentative: (organizationID: number, representativeIndex: number) => boolean;
export declare const setDefaultOrganizationRepresentative: (organizationID: number, representativeIndex: number) => boolean;
export declare const getOrganizationRemarks: (organizationID: number, reqSession: Express.SessionData) => llm.OrganizationRemark[];
export declare const getOrganizationRemark: (organizationID: number, remarkIndex: number, reqSession: Express.SessionData) => llm.OrganizationRemark;
export declare const addOrganizationRemark: (reqBody: llm.OrganizationRemark, reqSession: Express.SessionData) => number;
export declare const updateOrganizationRemark: (reqBody: llm.OrganizationRemark, reqSession: Express.SessionData) => boolean;
export declare const deleteOrganizationRemark: (organizationID: number, remarkIndex: number, reqSession: Express.SessionData) => boolean;
export declare const getUndismissedOrganizationReminders: (reqSession: Express.SessionData) => llm.OrganizationReminder[];
export declare const getOrganizationReminders: (organizationID: number, reqSession: Express.SessionData) => llm.OrganizationReminder[];
export declare const getOrganizationReminder: (organizationID: number, reminderIndex: number, reqSession: Express.SessionData) => llm.OrganizationReminder;
export declare const addOrganizationReminder: (reqBody: {
    organizationID: string;
    reminderTypeKey: string;
    reminderDateString?: string;
    reminderStatus: string;
    reminderNote: string;
}, reqSession: Express.SessionData) => llm.OrganizationReminder;
export declare const updateOrganizationReminder: (reqBody: {
    organizationID: string;
    reminderIndex: string;
    reminderTypeKey: string;
    reminderDateString?: string;
    reminderStatus: string;
    reminderNote: string;
    dismissedDateString: string;
}, reqSession: Express.SessionData) => boolean;
export declare const dismissOrganizationReminder: (organizationID: number, reminderIndex: number, reqSession: Express.SessionData) => boolean;
export declare const deleteOrganizationReminder: (organizationID: number, reminderIndex: number, reqSession: Express.SessionData) => boolean;
export declare const getOrganizationBankRecords: (organizationID: number, accountNumber: string, bankingYear: number) => llm.OrganizationBankRecord[];
export declare const getOrganizationBankRecordStats: (organizationID: number) => any[];
export declare const addOrganizationBankRecord: (reqBody: llm.OrganizationBankRecord, reqSession: Express.Session) => boolean;
export declare const updateOrganizationBankRecord: (reqBody: llm.OrganizationBankRecord, reqSession: Express.Session) => boolean;
export declare const deleteOrganizationBankRecord: (organizationID: number, recordIndex: number, reqSession: Express.Session) => boolean;