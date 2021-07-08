"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const urlPrefix = document.querySelector("main").dataset.urlPrefix;
    const formElement = document.querySelector("#form--organization");
    const formMessageElement = document.querySelector("#container--form-message");
    const organizationIDString = document.querySelector("#organization--organizationID").value;
    const isCreate = organizationIDString === "";
    const organizationID = (organizationIDString === ""
        ? undefined
        : Number.parseInt(organizationIDString, 10));
    formElement.addEventListener("submit", (formEvent) => {
        formEvent.preventDefault();
        formMessageElement.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";
        cityssm.postJSON(urlPrefix + "/organizations/doSave", formElement, (responseJSON) => {
            if (responseJSON.success) {
                cityssm.disableNavBlocker();
            }
            if (responseJSON.success && isCreate) {
                window.location.href = urlPrefix + "/organizations/" + responseJSON.organizationID.toString() + "/edit";
            }
            else {
                formMessageElement.innerHTML = "";
                cityssm.alertModal(responseJSON.message, "", "OK", responseJSON.success ? "success" : "danger");
            }
        });
    });
    if (!isCreate) {
        const deleteOrganizationFunction = () => {
            cityssm.postJSON(urlPrefix + "/organizations/doDelete", {
                organizationID
            }, (responseJSON) => {
                if (responseJSON.success) {
                    window.location.href = urlPrefix + "/organizations";
                }
            });
        };
        formElement.querySelector(".is-delete-button").addEventListener("click", () => {
            cityssm.confirmModal("Delete Organization?", ("Are you sure you want to delete this organization?<br />" +
                "Note that any active licences issued to this organization will remain active."), "Yes, Delete Organization", "warning", deleteOrganizationFunction);
        });
        formElement.querySelector(".is-rollforward-button").addEventListener("click", () => {
            let rollForwardCloseModalFunction;
            let formElement;
            let isSubmitting = false;
            const submitFunction = (formEvent) => {
                formEvent.preventDefault();
                if (isSubmitting) {
                    return;
                }
                isSubmitting = true;
                cityssm.postJSON(urlPrefix + "/organizations/doRollForward", formElement, (responseJSON) => {
                    if (responseJSON.success) {
                        window.location.reload();
                    }
                    else {
                        isSubmitting = false;
                        rollForwardCloseModalFunction();
                        cityssm.alertModal("Roll Forward Failed", responseJSON.message, "OK", "danger");
                    }
                });
            };
            cityssm.openHtmlModal("organization-rollforward", {
                onshown: (_modalElement, closeModalFunction) => {
                    rollForwardCloseModalFunction = closeModalFunction;
                    document.querySelector("#rollforward--organizationID").value =
                        organizationIDString;
                    formElement = document.querySelector("#form--rollforward");
                    formElement.addEventListener("submit", submitFunction);
                }
            });
        });
        const representativeTbodyElement = document.querySelector(".is-representative-table tbody");
        const showNoRepresentativesWarning = () => {
            if (representativeTbodyElement.querySelectorAll("tr").length === 0) {
                representativeTbodyElement.innerHTML = "<tr class=\"has-background-warning is-empty-warning\">" +
                    "<td class=\"has-text-centered\" colspan=\"6\">" +
                    "<strong>There are no representatives associated with this organization.</strong>" +
                    "</td>" +
                    "</tr>";
            }
        };
        showNoRepresentativesWarning();
        const updateDefaultRepresentativeFunction = (changeEvent) => {
            const defaultRepresentativeIndex = changeEvent.currentTarget.value;
            cityssm.postJSON(urlPrefix + "/organizations/" + organizationIDString + "/doSetDefaultRepresentative", {
                isDefaultRepresentativeIndex: defaultRepresentativeIndex
            }, () => {
            });
        };
        const radioElements = representativeTbodyElement.querySelectorAll("input");
        for (const radioElement of radioElements) {
            radioElement.addEventListener("change", updateDefaultRepresentativeFunction);
        }
        const deleteRepresentativeFunction = (clickEvent) => {
            clickEvent.preventDefault();
            const trElement = clickEvent.currentTarget.closest("tr");
            const representativeName = trElement.getAttribute("data-representative-name");
            cityssm.confirmModal("Delete a Representative?", `<p>Are you sure you want to delete the representative "${cityssm.escapeHTML(representativeName)}"?</p>`, "Yes, Delete", "danger", () => {
                cityssm.postJSON(urlPrefix + "/organizations/" + organizationIDString + "/doDeleteOrganizationRepresentative", {
                    representativeIndex: trElement.getAttribute("data-representative-index")
                }, (responseJSON) => {
                    if (responseJSON.success) {
                        trElement.remove();
                        showNoRepresentativesWarning();
                    }
                });
            });
        };
        const deleteButtonElements = representativeTbodyElement.querySelectorAll(".is-delete-representative-button");
        for (const deleteButtonElement of deleteButtonElements) {
            deleteButtonElement.addEventListener("click", deleteRepresentativeFunction);
        }
        const editRepresentativeModalElement = document.querySelector(".is-edit-representative-modal");
        const editRepresentativeFormElement = editRepresentativeModalElement.querySelector("form");
        let editRepresentativeTrElement;
        const openEditRepresentativeModalFunction = (clickEvent) => {
            editRepresentativeTrElement = clickEvent.currentTarget.closest("tr");
            const representativeIndex = editRepresentativeTrElement.dataset.representativeIndex;
            document.querySelector("#editOrganizationRepresentative--representativeIndex")
                .value = representativeIndex;
            document.querySelector("#editOrganizationRepresentative--representativeName").value = editRepresentativeTrElement.getAttribute("data-representative-name");
            document.querySelector("#editOrganizationRepresentative--representativeTitle")
                .value = editRepresentativeTrElement.getAttribute("data-representative-title");
            document.querySelector("#editOrganizationRepresentative--representativeAddress1")
                .value = editRepresentativeTrElement.getAttribute("data-representative-address-1");
            document.querySelector("#editOrganizationRepresentative--representativeAddress2")
                .value = editRepresentativeTrElement.getAttribute("data-representative-address-2");
            document.querySelector("#editOrganizationRepresentative--representativeCity")
                .value = editRepresentativeTrElement.getAttribute("data-representative-city");
            document.querySelector("#editOrganizationRepresentative--representativeProvince")
                .value = editRepresentativeTrElement.getAttribute("data-representative-province");
            document.querySelector("#editOrganizationRepresentative--representativePostalCode")
                .value = editRepresentativeTrElement.getAttribute("data-representative-postal-code");
            document.querySelector("#editOrganizationRepresentative--representativePhoneNumber")
                .value = editRepresentativeTrElement.getAttribute("data-representative-phone-number");
            document.querySelector("#editOrganizationRepresentative--representativePhoneNumber2")
                .value = editRepresentativeTrElement.getAttribute("data-representative-phone-number-2");
            document.querySelector("#editOrganizationRepresentative--representativeEmailAddress")
                .value = editRepresentativeTrElement.getAttribute("data-representative-email-address");
            document.querySelector("#editOrganizationRepresentative--isDefault").value =
                document.querySelector("#representative-isDefault--" + representativeIndex).checked
                    ? "1"
                    : "0";
            cityssm.showModal(editRepresentativeModalElement);
        };
        const insertRepresentativeRowFunction = (representativeObject) => {
            const trElement = document.createElement("tr");
            trElement.dataset.representativeIndex = representativeObject.representativeIndex.toString();
            trElement.dataset.representativeName = representativeObject.representativeName;
            trElement.dataset.representativeTitle = representativeObject.representativeTitle;
            trElement.dataset['representativeAddress-1'] = representativeObject.representativeAddress1;
            trElement.dataset['representativeAddress-2'] = representativeObject.representativeAddress2;
            trElement.dataset.representativeCity = representativeObject.representativeCity;
            trElement.dataset.representativeProvince = representativeObject.representativeProvince;
            trElement.dataset.representativePostalCode = representativeObject.representativePostalCode;
            trElement.dataset.representativePhoneNumber = representativeObject.representativePhoneNumber;
            trElement.dataset['representativePhoneNumber-2'] = representativeObject.representativePhoneNumber2;
            trElement.dataset.representativeEmailAddress = representativeObject.representativeEmailAddress;
            trElement.insertAdjacentHTML("beforeend", "<td>" +
                "<div class=\"field\">" +
                "<input class=\"is-checkradio is-info\"" +
                " id=\"representative-isDefault--" + representativeObject.representativeIndex.toString() + "\"" +
                " name=\"representative-isDefault\" type=\"radio\"" +
                (representativeObject.isDefault ? " checked" : "") + " />&nbsp;" +
                "<label for=\"representative-isDefault--" + representativeObject.representativeIndex.toString() + "\"></label>" +
                "</div>" +
                "</td>");
            trElement.querySelector("input").addEventListener("change", updateDefaultRepresentativeFunction);
            let tdElement = document.createElement("td");
            tdElement.innerHTML = cityssm.escapeHTML(representativeObject.representativeName) + "<br />" +
                "<small>" + cityssm.escapeHTML(representativeObject.representativeTitle) + "</small>";
            trElement.append(tdElement);
            tdElement = document.createElement("td");
            tdElement.innerHTML = cityssm.escapeHTML(representativeObject.representativeAddress1) + "<br />" +
                "<small>" +
                (representativeObject.representativeAddress2 === "" ? "" : cityssm.escapeHTML(representativeObject.representativeAddress2) + "<br />") +
                cityssm.escapeHTML(representativeObject.representativeCity) + ", " + cityssm.escapeHTML(representativeObject.representativeProvince) + "<br />" +
                cityssm.escapeHTML(representativeObject.representativePostalCode) +
                "</small>";
            trElement.append(tdElement);
            tdElement = document.createElement("td");
            tdElement.innerHTML = cityssm.escapeHTML(representativeObject.representativePhoneNumber) + "<br />" +
                cityssm.escapeHTML(representativeObject.representativePhoneNumber2);
            trElement.append(tdElement);
            tdElement = document.createElement("td");
            tdElement.innerHTML = cityssm.escapeHTML(representativeObject.representativeEmailAddress);
            trElement.append(tdElement);
            trElement.insertAdjacentHTML("beforeend", "<td>" +
                "<div class=\"buttons is-right has-addons\">" +
                ("<button class=\"button is-small is-edit-representative-button\"" +
                    " data-tooltip=\"Edit Representative\" type=\"button\">" +
                    "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                    "<span>Edit</span></button>") +
                ("<button class=\"button is-small has-text-danger is-delete-representative-button\"" +
                    " data-tooltip=\"Delete Representative\" type=\"button\">" +
                    "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
                    "<span class=\"sr-only\">Delete</span>" +
                    "</button>") +
                "</td>");
            trElement.querySelector(".is-edit-representative-button")
                .addEventListener("click", openEditRepresentativeModalFunction);
            trElement.querySelector(".is-delete-representative-button")
                .addEventListener("click", deleteRepresentativeFunction);
            representativeTbodyElement.append(trElement);
        };
        const editButtonElements = representativeTbodyElement.querySelectorAll(".is-edit-representative-button");
        for (const editButtonElement of editButtonElements) {
            editButtonElement.addEventListener("click", openEditRepresentativeModalFunction);
        }
        let cancelButtonElements = editRepresentativeModalElement.querySelectorAll(".is-cancel-button");
        for (const cancelButtonElement of cancelButtonElements) {
            cancelButtonElement.addEventListener("click", cityssm.hideModal);
        }
        editRepresentativeFormElement.addEventListener("submit", (formEvent) => {
            formEvent.preventDefault();
            cityssm.postJSON(urlPrefix + "/organizations/" + organizationIDString + "/doEditOrganizationRepresentative", formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    editRepresentativeTrElement.remove();
                    editRepresentativeTrElement = undefined;
                    insertRepresentativeRowFunction(responseJSON.organizationRepresentative);
                    cityssm.hideModal(editRepresentativeModalElement);
                }
            });
        });
        const addRepresentativeModalElement = document.querySelector(".is-add-representative-modal");
        const addRepresentativeFormElement = addRepresentativeModalElement.querySelector("form");
        document.querySelector(".is-add-representative-button").addEventListener("click", () => {
            addRepresentativeFormElement.reset();
            cityssm.showModal(addRepresentativeModalElement);
            document.querySelector("#addOrganizationRepresentative--representativeName").focus();
        });
        cancelButtonElements = addRepresentativeModalElement.querySelectorAll(".is-cancel-button");
        for (const cancelButtonElement of cancelButtonElements) {
            cancelButtonElement.addEventListener("click", cityssm.hideModal);
        }
        addRepresentativeFormElement.addEventListener("submit", (formEvent) => {
            formEvent.preventDefault();
            cityssm.postJSON(urlPrefix + "/organizations/" + organizationIDString + "/doAddOrganizationRepresentative", formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    const emptyWarningElement = representativeTbodyElement.querySelectorAll(".is-empty-warning");
                    if (emptyWarningElement.length > 0) {
                        emptyWarningElement[0].remove();
                    }
                    insertRepresentativeRowFunction(responseJSON.organizationRepresentative);
                    cityssm.hideModal(addRepresentativeModalElement);
                }
            });
        });
        addRepresentativeModalElement.querySelector(".is-copy-organization-address-button")
            .addEventListener("click", (clickEvent) => {
            clickEvent.preventDefault();
            document.querySelector("#addOrganizationRepresentative--representativeAddress1").value =
                document.querySelector("#organization--organizationAddress1").value;
            document.querySelector("#addOrganizationRepresentative--representativeAddress2").value =
                document.querySelector("#organization--organizationAddress2").value;
            document.querySelector("#addOrganizationRepresentative--representativeCity").value =
                document.querySelector("#organization--organizationCity").value;
            document.querySelector("#addOrganizationRepresentative--representativeProvince").value =
                document.querySelector("#organization--organizationProvince").value;
            document.querySelector("#addOrganizationRepresentative--representativePostalCode").value =
                document.querySelector("#organization--organizationPostalCode").value;
        });
        const deleteReminderClickFunction = (buttonEvent) => {
            buttonEvent.preventDefault();
            const buttonElement = buttonEvent.currentTarget;
            const reminderIndex = Number.parseInt(buttonElement.dataset.reminderIndex, 10);
            llm.organizationReminders.deleteReminder(organizationID, reminderIndex, true, (responseJSON) => {
                if (responseJSON.success) {
                    buttonElement.closest("tr").remove();
                }
            });
        };
        const dismissReminderClickFunction = (buttonEvent) => {
            buttonEvent.preventDefault();
            const buttonElement = buttonEvent.currentTarget;
            const reminderIndex = Number.parseInt(buttonElement.dataset.reminderIndex, 10);
            llm.organizationReminders.dismissReminder(organizationID, reminderIndex, true, (responseJSON) => {
                if (responseJSON.success) {
                    llm.organizationReminders.loadReminderTypeCache(() => {
                        const oldTrElement = buttonElement.closest("tr");
                        const newTrElement = renderReminderAsTableRow(responseJSON.reminder);
                        oldTrElement.after(newTrElement);
                        oldTrElement.remove();
                    });
                }
            });
        };
        const editReminderClickFunction = (buttonEvent) => {
            buttonEvent.preventDefault();
            const buttonElement = buttonEvent.currentTarget;
            const reminderIndex = Number.parseInt(buttonElement.dataset.reminderIndex, 10);
            llm.organizationReminders.openEditReminderModal(organizationID, reminderIndex, (reminderObject) => {
                const oldTrElement = buttonElement.closest("tr");
                const newTrElement = renderReminderAsTableRow(reminderObject);
                oldTrElement.after(newTrElement);
                oldTrElement.remove();
            });
        };
        const renderReminderAsTableRow = (reminder) => {
            const reminderType = llm.organizationReminders.getReminderType(reminder.reminderTypeKey);
            const trElement = document.createElement("tr");
            let reminderDateInnerHTML = "";
            if (reminder.dueDateString === "") {
                reminderDateInnerHTML = "<span class=\"has-text-grey\">(No Due Date Set)</span>";
            }
            else if (reminder.dismissedDateString !== "") {
                reminderDateInnerHTML = "<span class=\"has-text-grey is-linethrough\">" +
                    reminder.dueDateString +
                    "</span>";
            }
            else {
                reminderDateInnerHTML = reminder.dueDateString;
            }
            trElement.innerHTML = ("<td>" +
                (reminderType
                    ? reminderType.reminderType + "<br />" +
                        "<span class=\"is-size-7\">" + reminderType.reminderCategory + "</span>"
                    : reminder.reminderTypeKey) +
                "</td>") +
                "<td>" + (reminder.reminderStatus || "") + "</td>" +
                ("<td class=\"has-text-centered\">" +
                    (reminder.dismissedDateString === ""
                        ? "<span class=\"has-text-grey\">(Active)</span><br />" +
                            "<button class=\"button is-small is-light is-success is-dismiss-reminder-button mt-1\" data-reminder-index=\"" + reminder.reminderIndex.toString() + "\">" +
                            "<span class=\"icon is-small\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
                            "<span>Dismiss</span>" +
                            "</button>"
                        : reminder.dismissedDateString) +
                    "</td>") +
                ("<td class=\"has-text-centered\">" +
                    reminderDateInnerHTML +
                    "</td>") +
                ("<td class=\"is-hidden-print\">" +
                    "<div class=\"buttons is-right has-addons is-hidden-status-view\">" +
                    ("<button class=\"button is-small is-edit-reminder-button\"" +
                        " data-reminder-index=\"" + reminder.reminderIndex.toString() + "\"" +
                        " data-tooltip=\"Edit Reminder\" type=\"button\">" +
                        "<span class=\"icon is-small\">" +
                        "<i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i>" +
                        "</span>" +
                        "<span>Edit</span>" +
                        "</button>") +
                    ("<button class=\"button is-small has-text-danger is-delete-reminder-button\"" +
                        " data-reminder-index=\"" + reminder.reminderIndex.toString() + "\"" +
                        " data-tooltip=\"Delete Reminder\" type=\"button\">" +
                        "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
                        "<span class=\"sr-only\">Delete</span>" +
                        "</button>") +
                    "</div>" +
                    "</td>");
            if (reminder.dismissedDateString === "") {
                trElement.querySelector(".is-dismiss-reminder-button").addEventListener("click", dismissReminderClickFunction);
            }
            trElement.querySelector(".is-edit-reminder-button").addEventListener("click", editReminderClickFunction);
            trElement.querySelector(".is-delete-reminder-button").addEventListener("click", deleteReminderClickFunction);
            return trElement;
        };
        document.querySelector("#is-add-reminder-button").addEventListener("click", (clickEvent) => {
            clickEvent.preventDefault();
            llm.organizationReminders.openAddReminderModal(organizationID, (reminderObject) => {
                const trElement = renderReminderAsTableRow(reminderObject);
                document.querySelector("#container--reminders").prepend(trElement);
            });
        });
        const dismissReminderButtonElements = document.querySelectorAll(".is-dismiss-reminder-button");
        for (const buttonElement of dismissReminderButtonElements) {
            buttonElement.addEventListener("click", dismissReminderClickFunction);
        }
        const editReminderButtonElements = document.querySelectorAll(".is-edit-reminder-button");
        for (const buttonElement of editReminderButtonElements) {
            buttonElement.addEventListener("click", editReminderClickFunction);
        }
        const deleteReminderButtonElements = document.querySelectorAll(".is-delete-reminder-button");
        for (const buttonElement of deleteReminderButtonElements) {
            buttonElement.addEventListener("click", deleteReminderClickFunction);
        }
    }
    const setUnsavedChangesFunction = () => {
        cityssm.enableNavBlocker();
        formMessageElement.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
            "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
            " <span>Unsaved Changes</span>" +
            "</div>";
    };
    const inputElements = formElement.querySelectorAll("input, select, textarea");
    for (const inputElement of inputElements) {
        inputElement.addEventListener("change", setUnsavedChangesFunction);
    }
})();
