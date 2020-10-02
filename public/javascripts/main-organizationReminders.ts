import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";

import type * as recordTypes from "../../types/recordTypes";
import type * as configTypes from "../../types/configTypes";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


llm.organizationReminders = (() => {

  let reminderCategories: configTypes.ConfigReminderCategory[];
  const reminderTypeCache = new Map<string, configTypes.ConfigReminderType>();
  let dismissingStatuses = [];

  const loadReminderTypeCache = (callbackFn?: () => void) => {

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

          if (callbackFn) {
            callbackFn();
          }
        });

    } else if (callbackFn) {
      callbackFn();
    }

  };

  const getReminderType = (reminderTypeKey: string) => {
    return reminderTypeCache.get(reminderTypeKey);
  };

  const getRemindersByOrganizationID = (organizationID: number,
    callbackFn: (reminderList: recordTypes.OrganizationReminder[]) => void) => {

    cityssm.postJSON(
      "/organizations/doGetReminders", {
        organizationID
      },
      callbackFn
    );
  };

  const getReminderByID = (organizationID: number, reminderIndex: number,
    callbackFn: (reminder: recordTypes.OrganizationReminder) => void) => {

    cityssm.postJSON(
      "/organizations/doGetReminder", {
        organizationID,
        reminderIndex
      },
      callbackFn
    );
  };


  const openAddReminderModal = (organizationID: number,
    updateCallbackFn: (reminderObj: recordTypes.OrganizationReminder) => void) => {

    let addReminderCloseModalFn: () => void;

    const submitFn = (formEvent: Event) => {
      formEvent.preventDefault();

      cityssm.postJSON(
        "/organizations/doAddReminder",
        formEvent.currentTarget,
        (responseJSON) => {

          if (responseJSON.success) {
            addReminderCloseModalFn();

            if (updateCallbackFn) {
              updateCallbackFn(responseJSON.reminder);
            }
          }
        }
      );
    };

    const reminderTypeKeyChangeFn = (changeEvent: Event) => {

      const reminderTypeKey = (changeEvent.currentTarget as HTMLSelectElement).value;

      const reminderType = reminderTypeCache.get(reminderTypeKey);

      const reminderStatusSelectEle = document.getElementById("addReminder--reminderStatus") as HTMLSelectElement;

      reminderStatusSelectEle.value = "";
      reminderStatusSelectEle.innerHTML = "<option value=\"\">(Not Set)</option>";

      for (const reminderStatus of reminderType.reminderStatuses) {

        const optionEle = document.createElement("option");
        optionEle.value = reminderStatus;
        optionEle.innerText = reminderStatus;
        reminderStatusSelectEle.appendChild(optionEle);
      }
    };

    const openModalFn = () => {

      cityssm.openHtmlModal("reminderAdd", {

        onshow() {

          (document.getElementById("addReminder--organizationID") as HTMLInputElement).value =
            organizationID.toString();

          document.getElementById("addReminder--reminderDateString")
            .setAttribute("min", cityssm.dateToString(new Date()));

          getRemindersByOrganizationID(organizationID, (reminderList) => {

            const reminderTypeKeySelectEle =
              document.getElementById("addReminder--reminderTypeKey") as HTMLSelectElement;

            for (const reminderCategory of reminderCategories) {

              if (!reminderCategory.isActive) {
                continue;
              }

              const optgroupEle = document.createElement("optgroup");
              optgroupEle.label = reminderCategory.reminderCategory;

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

                const optionEle = document.createElement("option");
                optionEle.value = reminderType.reminderTypeKey;
                optionEle.innerText = reminderType.reminderType;
                optgroupEle.appendChild(optionEle);
              }

              reminderTypeKeySelectEle.appendChild(optgroupEle);
            }

            reminderTypeKeySelectEle.addEventListener("change", reminderTypeKeyChangeFn);

            reminderTypeKeySelectEle.closest(".select").classList.remove("is-loading");
          });

          document.getElementById("form--addReminder").addEventListener("submit", submitFn);
        },
        onshown(_modalEle, closeModalFn) {

          addReminderCloseModalFn = closeModalFn;
        }
      });
    };

    loadReminderTypeCache(openModalFn);
  };


  const openEditReminderModal = (organizationID: number, reminderIndex: number,
    updateCallbackFn: (reminderObj: recordTypes.OrganizationReminder) => void) => {

    let dismissedDateSetByUser = false;

    let editReminderCloseModalFn: () => void;

    const submitFn = (formEvent: Event) => {

      formEvent.preventDefault();

      cityssm.postJSON(
        "/organizations/doEditReminder",
        formEvent.currentTarget,
        (responseJSON: {
          success: boolean;
          reminder: recordTypes.OrganizationReminder;
        }) => {

          if (responseJSON.success) {
            editReminderCloseModalFn();

            if (updateCallbackFn) {
              updateCallbackFn(responseJSON.reminder);
            }
          }
        }
      );
    };

    const reminderTypeKeyChangeFn = () => {

      const reminderTypeKey =
        (document.getElementById("editReminder--reminderTypeKey") as HTMLSelectElement).value;

      const reminderType = reminderTypeCache.get(reminderTypeKey);

      const reminderStatusSelectEle =
        document.getElementById("editReminder--reminderStatus") as HTMLSelectElement;

      reminderStatusSelectEle.value = "";
      reminderStatusSelectEle.innerHTML = "<option data-is-dismissing=\"0\" value=\"\">(Not Set)</option>";

      for (const reminderStatus of reminderType.reminderStatuses) {

        const optionEle = document.createElement("option");
        optionEle.value = reminderStatus;
        optionEle.innerText = reminderStatus;

        optionEle.setAttribute("data-is-dismissing",
          dismissingStatuses.includes(reminderStatus) ? "1" : "0");

        reminderStatusSelectEle.appendChild(optionEle);
      }
    };

    const reminderStatusChangeFn = (selectChangeEvent: Event) => {

      if (dismissedDateSetByUser) {
        return;
      }

      const isDismissing = (selectChangeEvent.currentTarget as HTMLSelectElement)
        .selectedOptions[0]
        .getAttribute("data-is-dismissing") === "1";

      (document.getElementById("editReminder--dismissedDateString") as HTMLInputElement).value =
        (isDismissing
          ? cityssm.dateToString(new Date())
          : "");
    };

    const openModalFn = () => {
      cityssm.openHtmlModal("reminderEdit", {

        onshow() {

          (document.getElementById("editReminder--organizationID") as HTMLInputElement).value =
            organizationID.toString();

          (document.getElementById("editReminder--reminderIndex") as HTMLInputElement).value =
            reminderIndex.toString();

          document.getElementById("form--editReminder").addEventListener("submit", submitFn);
        },
        onshown(_modalEle, closeModalFn) {

          editReminderCloseModalFn = closeModalFn;

          getRemindersByOrganizationID(organizationID, (reminderList) => {

            // Find the reminder that will be updated

            const reminder = reminderList.find((possibleReminder) => {
              return possibleReminder.reminderIndex === reminderIndex;
            });

            if (!reminder) {
              editReminderCloseModalFn();
              cityssm.alertModal("Reminder Not Found", "", "OK", "danger");
              return;
            }

            const reminderTypeKeySelectEle =
              document.getElementById("editReminder--reminderTypeKey") as HTMLSelectElement;

            // Show current reminder type, and active, unused types

            for (const reminderCategory of reminderCategories) {

              const optgroupEle = document.createElement("optgroup");
              optgroupEle.label = reminderCategory.reminderCategory;

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

                const optionEle = document.createElement("option");
                optionEle.value = reminderType.reminderTypeKey;
                optionEle.innerText = reminderType.reminderType;

                optgroupEle.appendChild(optionEle);
              }

              if (optgroupEle.children.length > 0) {
                reminderTypeKeySelectEle.appendChild(optgroupEle);
              }
            }

            reminderTypeKeySelectEle.value = reminder.reminderTypeKey;
            reminderTypeKeySelectEle.addEventListener("change", reminderTypeKeyChangeFn);
            reminderTypeKeySelectEle.closest(".select").classList.remove("is-loading");

            // Reminder date

            (document.getElementById("editReminder--reminderDateString") as HTMLInputElement).value =
              reminder.reminderDateString;

            // Initialize the reminder status select

            reminderTypeKeyChangeFn();

            const reminderStatusSelectEle =
              document.getElementById("editReminder--reminderStatus") as HTMLSelectElement;

            if (reminder.reminderStatus && reminder.reminderStatus !== "") {

              let currentStatusOptionFound = false;

              for (const possibleOptionEle of reminderStatusSelectEle.options) {
                if (possibleOptionEle.value === reminder.reminderStatus) {
                  currentStatusOptionFound = true;
                  break;
                }
              }

              if (!currentStatusOptionFound) {
                const missingOptionEle = document.createElement("option");
                missingOptionEle.innerText = reminder.reminderStatus;
                missingOptionEle.value = reminder.reminderStatus;
                reminderStatusSelectEle.appendChild(missingOptionEle);
              }

              reminderStatusSelectEle.value = reminder.reminderStatus;
            }

            reminderStatusSelectEle.addEventListener("change", reminderStatusChangeFn);

            // Reminder note

            (document.getElementById("editReminder--reminderNote") as HTMLTextAreaElement).value =
              reminder.reminderNote;

            // Dismissed date

            const dismissedDateEle = document.getElementById("editReminder--dismissedDateString") as HTMLInputElement;

            dismissedDateEle.value = reminder.dismissedDateString;
            dismissedDateEle.setAttribute("max", cityssm.dateToString(new Date()));

            if (reminder.dismissedDateString !== "") {
              dismissedDateSetByUser = true;
            }

            dismissedDateEle.addEventListener("change", () => {
              dismissedDateSetByUser = true;
            });
          });
        }
      });
    };

    loadReminderTypeCache(openModalFn);
  };


  const doDismissReminder = (organizationID: number, reminderIndex: number, callbackFn: (response: {
    success: boolean;
    message: string;
    reminder: recordTypes.OrganizationReminder;
  }) => void) => {

    cityssm.postJSON(
      "/organizations/doDismissReminder", {
        organizationID,
        reminderIndex
      },
      callbackFn
    );
  };


  const dismissReminder = (organizationID: number, reminderIndex: number, doConfirm: boolean,
    dismissCallbackFn: (response: {
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
          doDismissReminder(organizationID, reminderIndex, dismissCallbackFn);
        }
      );

    } else {
      doDismissReminder(organizationID, reminderIndex, dismissCallbackFn);
    }
  };

  const doDeleteReminder = (organizationID: number, reminderIndex: number, callbackFn: (response: {
    success: boolean;
    message: string;
  }) => void) => {

    cityssm.postJSON(
      "/organizations/doDeleteReminder", {
        organizationID,
        reminderIndex
      },
      callbackFn
    );
  };


  const deleteReminder = (organizationID: number, reminderIndex: number, doConfirm: boolean,
    deleteCallbackFn: (response: {
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
          doDeleteReminder(organizationID, reminderIndex, deleteCallbackFn);
        }
      );

    } else {
      doDeleteReminder(organizationID, reminderIndex, deleteCallbackFn);
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
