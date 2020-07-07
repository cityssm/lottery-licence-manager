"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
llm.organizationReminders = (() => {
    let reminderCategories;
    const reminderTypeCache = new Map();
    const loadReminderTypeCache = (callbackFn) => {
        if (reminderTypeCache.size === 0) {
            llm.getDefaultConfigProperty("reminderCategories", (reminderCategoriesResult) => {
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
        }
        else if (callbackFn) {
            callbackFn();
        }
    };
    const getReminderType = (reminderTypeKey) => {
        return reminderTypeCache.get(reminderTypeKey);
    };
    const getRemindersByOrganizationID = (organizationID, callbackFn) => {
        cityssm.postJSON("/organizations/doGetReminders", {
            organizationID
        }, callbackFn);
    };
    const getReminderByID = (organizationID, reminderIndex, callbackFn) => {
        cityssm.postJSON("/organizations/doGetReminder", {
            organizationID,
            reminderIndex
        }, callbackFn);
    };
    const openAddReminderModal = (organizationID, updateCallbackFn) => {
        let addReminderCloseModalFn;
        const submitFn = (formEvent) => {
            formEvent.preventDefault();
            cityssm.postJSON("/organizations/doAddReminder", formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    addReminderCloseModalFn();
                    if (updateCallbackFn) {
                        updateCallbackFn(responseJSON.reminder);
                    }
                }
            });
        };
        const reminderTypeKeyChangeFn = (changeEvent) => {
            const reminderTypeKey = changeEvent.currentTarget.value;
            const reminderType = reminderTypeCache.get(reminderTypeKey);
            const reminderStatusSelectEle = document.getElementById("addReminder--reminderStatus");
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
                    document.getElementById("addReminder--organizationID").value =
                        organizationID.toString();
                    document.getElementById("addReminder--reminderDateString")
                        .setAttribute("min", cityssm.dateToString(new Date()));
                    getRemindersByOrganizationID(organizationID, (reminderList) => {
                        const reminderTypeKeySelectEle = document.getElementById("addReminder--reminderTypeKey");
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
    const openEditReminderModal = (organizationID, reminderIndex, updateCallbackFn) => {
    };
    const doDeleteReminder = (organizationID, reminderIndex, callbackFn) => {
        cityssm.postJSON("/organizations/doDeleteReminder", {
            organizationID,
            reminderIndex
        }, callbackFn);
    };
    const deleteReminder = (organizationID, reminderIndex, doConfirm, deleteCallbackFn) => {
        if (doConfirm) {
            cityssm.confirmModal("Delete Reminder?", "Are you sure you want to delete this reminder?", "Yes, Delete", "danger", () => {
                doDeleteReminder(organizationID, reminderIndex, deleteCallbackFn);
            });
        }
        else {
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
