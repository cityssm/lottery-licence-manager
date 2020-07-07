import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";
import type * as llmTypes from "../../helpers/llmTypes";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


llm.organizationReminders = (() => {

  let reminderCategories: llmTypes.ConfigReminderCategory[];
  const reminderTypeCache = new Map<string, llmTypes.ConfigReminderType>();

  const loadReminderTypeCache = (callbackFn?: () => void) => {

    if (reminderTypeCache.size === 0) {

      llm.getDefaultConfigProperty("reminderCategories",
        (reminderCategoriesResult: llmTypes.ConfigReminderCategory[]) => {

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
    callbackFn: (reminderList: llmTypes.OrganizationReminder[]) => void) => {

    cityssm.postJSON(
      "/organizations/doGetReminders", {
        organizationID
      },
      callbackFn
    );
  };

  const getReminderByID = (organizationID: number, reminderIndex: number,
    callbackFn: (reminder: llmTypes.OrganizationReminder) => void) => {

    cityssm.postJSON(
      "/organizations/doGetReminder", {
        organizationID,
        reminderIndex
      },
      callbackFn
    );
  };

  const openAddReminderModal = (organizationID: number,
    updateCallbackFn: (reminderObj: llmTypes.OrganizationReminder) => void) => {

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

  const openEditReminderModal = (organizationID: number, reminderIndex: number, updateCallbackFn: () => void) => {

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
    getRemindersByOrganizationID,
    getReminderByID,
    openAddReminderModal,
    openEditReminderModal,
    deleteReminder,
    getReminderType
  };
})();
