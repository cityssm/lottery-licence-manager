import type * as llmTypes from "../../helpers/llmTypes";
export interface llmGlobal {
    arrayToObject?: (array: [], objectKey: string | number) => {};
    getDefaultConfigProperty?: (propertyName: string, propertyValueCallbackFn: (propertyValue: any) => void) => void;
    initializeDateRangeSelector?: (containerEle: HTMLElement, changeFn: () => void) => void;
    initializeTabs?: (tabsListEle: HTMLElement, callbackFns?: {
        onshown?: (tabContentEle: HTMLElement) => void;
    }) => void;
    organizationRemarks?: {
        getRemarksByOrganizationID: (organizationID: number, callbackFn: (remarkList: llmTypes.OrganizationRemark[]) => void) => void;
        getRemarkByID: (organizationID: number, remarkIndex: number, callbackFn: (remark: llmTypes.OrganizationRemark) => void) => void;
        openAddRemarkModal: (organizationID: number, updateCallbackFn: () => void) => void;
        openEditRemarkModal: (organizationID: number, remarkIndex: number, updateCallbackFn: () => void) => void;
        deleteRemark: (organizationID: number, remarkIndex: number, doConfirm: boolean, deleteCallbackFn: (response: {
            success: boolean;
            message: string;
        }) => void) => void;
    };
    organizationReminders?: {
        getRemindersByOrganizationID: (organizationID: number, callbackFn: (reminderList: llmTypes.OrganizationReminder[]) => void) => void;
        getReminderByID: (organizationID: number, reminderIndex: number, callbackFn: (reminder: llmTypes.OrganizationReminder) => void) => void;
        openAddReminderModal: (organizationID: number, updateCallbackFn: (reminderObj: llmTypes.OrganizationReminder) => void) => void;
        openEditReminderModal: (organizationID: number, reminderIndex: number, updateCallbackFn: () => void) => void;
        deleteReminder: (organizationID: number, reminderIndex: number, doConfirm: boolean, deleteCallbackFn: (response: {
            success: boolean;
            message: string;
        }) => void) => void;
        getReminderType: (reminderTypeKey: string) => llmTypes.ConfigReminderType;
    };
}
