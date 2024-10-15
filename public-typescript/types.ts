import type * as configTypes from '../types/configTypes.js'
import type * as recordTypes from '../types/recordTypes.js'

export interface llmGlobal {
  arrayToObject: (
    array: [],
    objectKey: string | number
  ) => Record<string | number, unknown>

  formatDollarsAsHTML: (dollarAmt: number) => string

  getDefaultConfigProperty: (
    propertyName: string,
    propertyValueCallbackFunction: (propertyValue: unknown) => void
  ) => void

  initializeDateRangeSelector: (
    containerElement: HTMLElement,
    changeFunction: () => void
  ) => void

  initializeTabs: (
    tabsListElement: HTMLElement,
    callbackFunctions?: {
      onshown?: (tabContentElement: HTMLElement) => void
    }
  ) => void

  organizationRemarks?: {
    getRemarksByOrganizationID: (
      organizationID: number,
      callbackFunction: (remarkList: recordTypes.OrganizationRemark[]) => void
    ) => void

    getRemarkByID: (
      organizationID: number,
      remarkIndex: number,
      callbackFunction: (remark: recordTypes.OrganizationRemark) => void
    ) => void

    openAddRemarkModal: (
      organizationID: number,
      updateCallbackFunction: () => void
    ) => void

    openEditRemarkModal: (
      organizationID: number,
      remarkIndex: number,
      updateCallbackFunction: () => void
    ) => void

    deleteRemark: (
      organizationID: number,
      remarkIndex: number,
      doConfirm: boolean,
      deleteCallbackFunction: (response: {
        success: boolean
        message: string
      }) => void
    ) => void
  }

  organizationReminders?: {
    loadReminderTypeCache: (callbackFunction: () => void) => void

    getRemindersByOrganizationID: (
      organizationID: number,
      callbackFunction: (
        reminderList: recordTypes.OrganizationReminder[]
      ) => void
    ) => void

    getReminderByID: (
      organizationID: number,
      reminderIndex: number,
      callbackFunction: (reminder: recordTypes.OrganizationReminder) => void
    ) => void

    openAddReminderModal: (
      organizationID: number,
      updateCallbackFunction: (
        reminderObject: recordTypes.OrganizationReminder
      ) => void
    ) => void

    openEditReminderModal: (
      organizationID: number,
      reminderIndex: number,
      updateCallbackFunction: (
        reminderObject?: recordTypes.OrganizationReminder
      ) => void
    ) => void

    dismissReminder: (
      organizationID: number,
      reminderIndex: number,
      doConfirm: boolean,
      deleteCallbackFunction: (response: {
        success: boolean
        message: string
        reminder?: recordTypes.OrganizationReminder
      }) => void
    ) => void

    deleteReminder: (
      organizationID: number,
      reminderIndex: number,
      doConfirm: boolean,
      deleteCallbackFunction: (response: {
        success: boolean
        message: string
      }) => void
    ) => void

    getReminderType: (reminderTypeKey: string) => configTypes.ConfigReminderType
  }

  licenceEdit?: llmLicenceEditGlobal
}

export interface llmLicenceEditGlobal {
  setUnsavedChangesFunction?: (changeEvent?: Event) => void
  setDoRefreshAfterSaveFunction?: () => void
  loadLocationListFunction?: (
    callbackFunction: (locationList: recordTypes.Location[]) => void
  ) => void
}
