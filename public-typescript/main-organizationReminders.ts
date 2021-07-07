/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";

import type * as recordTypes from "../types/recordTypes";
import type * as configTypes from "../types/configTypes";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


llm.organizationReminders = (() => {

  const urlPrefix = document.querySelector("main").dataset.urlPrefix;

  let reminderCategories: configTypes.ConfigReminderCategory[];
  const reminderTypeCache = new Map<string, configTypes.ConfigReminderType>();
  let dismissingStatuses = [];

  const loadReminderTypeCache = (callbackFunction?: () => void) => {

    if (reminderTypeCache.size === 0) {

      llm.getDefaultConfigProperty("dismissingStatuses", (statuses: string[]) => {
        dismissingStatuses = statuses;
      });

      llm.getDefaultConfigProperty("reminderCategories",
        (reminderCategoriesResult: configTypes.ConfigReminderCategory[]) => {

          reminderCategories = reminderCategoriesResult;

          for (const reminderCategory of reminderCategories) {
            for (const reminderType of reminderCategory.reminderTypes) {
              reminderType.reminderCategory = reminderCategory.reminderCategory;
              reminderTypeCache.set(reminderType.reminderTypeKey, reminderType);
            }
          }

          if (callbackFunction) {
            callbackFunction();
          }
        });

    } else if (callbackFunction) {
      callbackFunction();
    }

  };

  const getReminderType = (reminderTypeKey: string) => {
    return reminderTypeCache.get(reminderTypeKey);
  };

  const getRemindersByOrganizationID = (organizationID: number,
    callbackFunction: (reminderList: recordTypes.OrganizationReminder[]) => void) => {

    cityssm.postJSON(urlPrefix + "/organizations/doGetReminders", {
      organizationID
    },
      callbackFunction
    );
  };

  const getReminderByID = (organizationID: number, reminderIndex: number,
    callbackFunction: (reminder: recordTypes.OrganizationReminder) => void) => {

    cityssm.postJSON(urlPrefix + "/organizations/doGetReminder", {
      organizationID,
      reminderIndex
    },
      callbackFunction
    );
  };


  const openAddReminderModal = (organizationID: number,
    updateCallbackFunction: (reminderObject: recordTypes.OrganizationReminder) => void) => {

    let addReminderCloseModalFunction: () => void;

    const submitFunction = (formEvent: Event) => {
      formEvent.preventDefault();

      cityssm.postJSON(urlPrefix + "/organizations/doAddReminder",
        formEvent.currentTarget,
        (responseJSON: { success: boolean; reminder: recordTypes.OrganizationReminder }) => {

          if (responseJSON.success) {
            addReminderCloseModalFunction();

            if (updateCallbackFunction) {
              updateCallbackFunction(responseJSON.reminder);
            }
          }
        }
      );
    };

    const reminderTypeKeyChangeFunction = (changeEvent: Event) => {

      const reminderTypeKey = (changeEvent.currentTarget as HTMLSelectElement).value;

      const reminderType = reminderTypeCache.get(reminderTypeKey);

      const reminderStatusSelectElement = document.querySelector("#addReminder--reminderStatus") as HTMLSelectElement;

      reminderStatusSelectElement.value = "";
      reminderStatusSelectElement.innerHTML = "<option value=\"\">(Not Set)</option>";

      for (const reminderStatus of reminderType.reminderStatuses) {

        const optionElement = document.createElement("option");
        optionElement.value = reminderStatus;
        optionElement.textContent = reminderStatus;
        reminderStatusSelectElement.append(optionElement);
      }
    };

    const openModalFunction = () => {

      cityssm.openHtmlModal("reminderAdd", {

        onshow() {

          (document.querySelector("#addReminder--organizationID") as HTMLInputElement).value =
            organizationID.toString();

          document.querySelector("#addReminder--dueDateString")
            .setAttribute("min", cityssm.dateToString(new Date()));

          getRemindersByOrganizationID(organizationID, (reminderList) => {

            const reminderTypeKeySelectElement =
              document.querySelector("#addReminder--reminderTypeKey") as HTMLSelectElement;

            for (const reminderCategory of reminderCategories) {

              if (!reminderCategory.isActive) {
                continue;
              }

              const optgroupElement = document.createElement("optgroup");
              optgroupElement.label = reminderCategory.reminderCategory;

              for (const reminderType of reminderCategory.reminderTypes) {

                if (!reminderType.isActive) {
                  continue;
                }

                if (reminderType.hasUndismissedLimit) {

                  const activeReminder = reminderList.find((possibleReminder) => {
                    return possibleReminder.reminderTypeKey === reminderType.reminderTypeKey &&
                      possibleReminder.dismissedDateString === "";
                  });

                  if (activeReminder) {
                    continue;
                  }
                }

                const optionElement = document.createElement("option");
                optionElement.value = reminderType.reminderTypeKey;
                optionElement.textContent = reminderType.reminderType;
                optgroupElement.append(optionElement);
              }

              reminderTypeKeySelectElement.append(optgroupElement);
            }

            reminderTypeKeySelectElement.addEventListener("change", reminderTypeKeyChangeFunction);

            reminderTypeKeySelectElement.closest(".select").classList.remove("is-loading");
          });

          document.querySelector("#form--addReminder").addEventListener("submit", submitFunction);
        },
        onshown(_modalElement, closeModalFunction) {
          addReminderCloseModalFunction = closeModalFunction;
        }
      });
    };

    loadReminderTypeCache(openModalFunction);
  };


  const openEditReminderModal = (organizationID: number, reminderIndex: number,
    updateCallbackFunction: (reminderObject: recordTypes.OrganizationReminder) => void) => {

    let dismissedDateSetByUser = false;

    let editReminderCloseModalFunction: () => void;

    const submitFunction = (formEvent: Event) => {

      formEvent.preventDefault();

      cityssm.postJSON(urlPrefix + "/organizations/doEditReminder",
        formEvent.currentTarget,
        (responseJSON: {
          success: boolean;
          reminder: recordTypes.OrganizationReminder;
        }) => {

          if (responseJSON.success) {
            editReminderCloseModalFunction();

            if (updateCallbackFunction) {
              updateCallbackFunction(responseJSON.reminder);
            }
          }
        }
      );
    };

    const reminderTypeKeyChangeFunction = () => {

      const reminderTypeKey =
        (document.querySelector("#editReminder--reminderTypeKey") as HTMLSelectElement).value;

      const reminderType = reminderTypeCache.get(reminderTypeKey);

      const reminderStatusSelectElement =
        document.querySelector("#editReminder--reminderStatus") as HTMLSelectElement;

      reminderStatusSelectElement.value = "";
      reminderStatusSelectElement.innerHTML = "<option data-is-dismissing=\"0\" value=\"\">(Not Set)</option>";

      for (const reminderStatus of reminderType.reminderStatuses) {

        const optionElement = document.createElement("option");
        optionElement.value = reminderStatus;
        optionElement.textContent = reminderStatus;

        optionElement.dataset.isDismissing =
          dismissingStatuses.includes(reminderStatus) ? "1" : "0";

        reminderStatusSelectElement.append(optionElement);
      }
    };

    const reminderStatusChangeFunction = (selectChangeEvent: Event) => {

      if (dismissedDateSetByUser) {
        return;
      }

      const isDismissing = (selectChangeEvent.currentTarget as HTMLSelectElement)
        .selectedOptions[0]
        .dataset.isDismissing === "1";

      (document.querySelector("#editReminder--dismissedDateString") as HTMLInputElement).value =
        (isDismissing
          ? cityssm.dateToString(new Date())
          : "");
    };

    const openModalFunction = () => {
      cityssm.openHtmlModal("reminderEdit", {

        onshow() {

          (document.querySelector("#editReminder--organizationID") as HTMLInputElement).value =
            organizationID.toString();

          (document.querySelector("#editReminder--reminderIndex") as HTMLInputElement).value =
            reminderIndex.toString();

          document.querySelector("#form--editReminder").addEventListener("submit", submitFunction);
        },
        onshown(_modalElement, closeModalFunction) {

          editReminderCloseModalFunction = closeModalFunction;

          getRemindersByOrganizationID(organizationID, (reminderList) => {

            // Find the reminder that will be updated

            const reminder = reminderList.find((possibleReminder) => {
              return possibleReminder.reminderIndex === reminderIndex;
            });

            if (!reminder) {
              editReminderCloseModalFunction();
              cityssm.alertModal("Reminder Not Found", "", "OK", "danger");
              return;
            }

            const reminderTypeKeySelectElement =
              document.querySelector("#editReminder--reminderTypeKey") as HTMLSelectElement;

            // Show current reminder type, and active, unused types

            for (const reminderCategory of reminderCategories) {

              const optgroupElement = document.createElement("optgroup");
              optgroupElement.label = reminderCategory.reminderCategory;

              for (const reminderType of reminderCategory.reminderTypes) {

                if (reminderType.reminderTypeKey !== reminder.reminderTypeKey) {

                  if (!reminderType.isActive || !reminderCategory.isActive) {
                    continue;
                  }

                  if (reminderType.hasUndismissedLimit) {

                    const activeReminder = reminderList.find((possibleReminder) => {
                      return possibleReminder.reminderTypeKey === reminderType.reminderTypeKey &&
                        possibleReminder.dismissedDateString === "";
                    });

                    if (activeReminder) {
                      continue;
                    }
                  }
                }

                const optionElement = document.createElement("option");
                optionElement.value = reminderType.reminderTypeKey;
                optionElement.textContent = reminderType.reminderType;

                optgroupElement.append(optionElement);
              }

              if (optgroupElement.children.length > 0) {
                reminderTypeKeySelectElement.append(optgroupElement);
              }
            }

            reminderTypeKeySelectElement.value = reminder.reminderTypeKey;
            reminderTypeKeySelectElement.addEventListener("change", reminderTypeKeyChangeFunction);
            reminderTypeKeySelectElement.closest(".select").classList.remove("is-loading");

            // Due date

            (document.querySelector("#editReminder--dueDateString") as HTMLInputElement).value =
              reminder.dueDateString;

            // Initialize the reminder status select

            reminderTypeKeyChangeFunction();

            const reminderStatusSelectElement =
              document.querySelector("#editReminder--reminderStatus") as HTMLSelectElement;

            if (reminder.reminderStatus && reminder.reminderStatus !== "") {

              let currentStatusOptionFound = false;

              for (const possibleOptionElement of reminderStatusSelectElement.options) {
                if (possibleOptionElement.value === reminder.reminderStatus) {
                  currentStatusOptionFound = true;
                  break;
                }
              }

              if (!currentStatusOptionFound) {
                const missingOptionElement = document.createElement("option");
                missingOptionElement.textContent = reminder.reminderStatus;
                missingOptionElement.value = reminder.reminderStatus;
                reminderStatusSelectElement.append(missingOptionElement);
              }

              reminderStatusSelectElement.value = reminder.reminderStatus;
            }

            reminderStatusSelectElement.addEventListener("change", reminderStatusChangeFunction);

            // Reminder note

            (document.querySelector("#editReminder--reminderNote") as HTMLTextAreaElement).value =
              reminder.reminderNote;

            // Dismissed date

            const dismissedDateElement = document.querySelector("#editReminder--dismissedDateString") as HTMLInputElement;

            dismissedDateElement.value = reminder.dismissedDateString;
            dismissedDateElement.setAttribute("max", cityssm.dateToString(new Date()));

            if (reminder.dismissedDateString !== "") {
              dismissedDateSetByUser = true;
            }

            dismissedDateElement.addEventListener("change", () => {
              dismissedDateSetByUser = true;
            });
          });
        }
      });
    };

    loadReminderTypeCache(openModalFunction);
  };


  const doDismissReminder = (organizationID: number, reminderIndex: number, callbackFunction: (response: {
    success: boolean;
    message: string;
    reminder: recordTypes.OrganizationReminder;
  }) => void) => {

    cityssm.postJSON(urlPrefix + "/organizations/doDismissReminder", {
      organizationID,
      reminderIndex
    },
      callbackFunction
    );
  };


  const dismissReminder = (organizationID: number, reminderIndex: number, doConfirm: boolean,
    dismissCallbackFunction: (response: {
      success: boolean;
      message: string;
    }) => void) => {

    if (doConfirm) {

      cityssm.confirmModal(
        "Dismiss Reminder?",
        "Are you sure you want to dismiss this reminder?",
        "Yes, Dismiss",
        "warning",
        () => {
          doDismissReminder(organizationID, reminderIndex, dismissCallbackFunction);
        }
      );

    } else {
      doDismissReminder(organizationID, reminderIndex, dismissCallbackFunction);
    }
  };

  const doDeleteReminder = (organizationID: number, reminderIndex: number, callbackFunction: (response: {
    success: boolean;
    message: string;
  }) => void) => {

    cityssm.postJSON(urlPrefix + "/organizations/doDeleteReminder", {
      organizationID,
      reminderIndex
    },
      callbackFunction
    );
  };


  const deleteReminder = (organizationID: number, reminderIndex: number, doConfirm: boolean,
    deleteCallbackFunction: (response: {
      success: boolean;
      message: string;
    }) => void) => {

    if (doConfirm) {

      cityssm.confirmModal(
        "Delete Reminder?",
        "Are you sure you want to delete this reminder?",
        "Yes, Delete",
        "danger",
        () => {
          doDeleteReminder(organizationID, reminderIndex, deleteCallbackFunction);
        }
      );

    } else {
      doDeleteReminder(organizationID, reminderIndex, deleteCallbackFunction);
    }
  };


  return {
    loadReminderTypeCache,
    getRemindersByOrganizationID,
    getReminderByID,
    openAddReminderModal,
    openEditReminderModal,
    dismissReminder,
    deleteReminder,
    getReminderType
  };
})();
