import type * as recordTypes from "../types/recordTypes";
import type * as configTypes from "../types/configTypes";


export interface llmGlobal {

  arrayToObject?: (array: [], objectKey: string | number) => {};

  getDefaultConfigProperty?: (propertyName: string, propertyValueCallbackFn: (propertyValue: any) => void) => void;

  initializeDateRangeSelector?: (containerEle: HTMLElement, changeFn: () => void) => void;

  initializeTabs?: (tabsListEle: HTMLElement, callbackFns?: {
    onshown?: (tabContentEle: HTMLElement) => void;
  }) => void;

  organizationRemarks?: {

    getRemarksByOrganizationID: (organizationID: number,
      callbackFn: (remarkList: recordTypes.OrganizationRemark[]) => void) => void;

    getRemarkByID: (organizationID: number, remarkIndex: number,
      callbackFn: (remark: recordTypes.OrganizationRemark) => void) => void;

    openAddRemarkModal: (organizationID: number,
      updateCallbackFn: () => void) => void;

    openEditRemarkModal: (organizationID: number, remarkIndex: number,
      updateCallbackFn: () => void) => void;

    deleteRemark: (organizationID: number, remarkIndex: number, doConfirm: boolean,
      deleteCallbackFn: (response: {
        success: boolean;
        message: string;
      }) => void) => void;
  };

  organizationReminders?: {

    loadReminderTypeCache: (callbackFn: () => void) => void;

    getRemindersByOrganizationID: (organizationID: number,
      callbackFn: (reminderList: recordTypes.OrganizationReminder[]) => void) => void;

    getReminderByID: (organizationID: number, reminderIndex: number,
      callbackFn: (reminder: recordTypes.OrganizationReminder) => void) => void;

    openAddReminderModal: (organizationID: number,
      updateCallbackFn: (reminderObj: recordTypes.OrganizationReminder) => void) => void;

    openEditReminderModal: (organizationID: number, reminderIndex: number,
      updateCallbackFn: (reminderObj?: recordTypes.OrganizationReminder) => void) => void;

    dismissReminder: (organizationID: number, reminderIndex: number, doConfirm: boolean,
      deleteCallbackFn: (response: {
        success: boolean;
        message: string;
        reminder?: recordTypes.OrganizationReminder;
      }) => void) => void;

    deleteReminder: (organizationID: number, reminderIndex: number, doConfirm: boolean,
      deleteCallbackFn: (response: {
        success: boolean;
        message: string;
      }) => void) => void;

    getReminderType: (reminderTypeKey: string) => configTypes.ConfigReminderType;
  };
}
