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
        const editRepresentativeFormEle = editRepresentativeModalElement.getElementsByTagName("form")[0];
        let editRepresentativeTrEle;
        const openEditRepresentativeModalFn = (clickEvent) => {
            editRepresentativeTrEle = clickEvent.currentTarget.closest("tr");
            const representativeIndex = editRepresentativeTrEle.getAttribute("data-representative-index");
            document.getElementById("editOrganizationRepresentative--representativeIndex")
                .value = representativeIndex;
            document.getElementById("editOrganizationRepresentative--representativeName").value = editRepresentativeTrEle.getAttribute("data-representative-name");
            document.getElementById("editOrganizationRepresentative--representativeTitle")
                .value = editRepresentativeTrEle.getAttribute("data-representative-title");
            document.getElementById("editOrganizationRepresentative--representativeAddress1")
                .value = editRepresentativeTrEle.getAttribute("data-representative-address-1");
            document.getElementById("editOrganizationRepresentative--representativeAddress2")
                .value = editRepresentativeTrEle.getAttribute("data-representative-address-2");
            document.getElementById("editOrganizationRepresentative--representativeCity")
                .value = editRepresentativeTrEle.getAttribute("data-representative-city");
            document.getElementById("editOrganizationRepresentative--representativeProvince")
                .value = editRepresentativeTrEle.getAttribute("data-representative-province");
            document.getElementById("editOrganizationRepresentative--representativePostalCode")
                .value = editRepresentativeTrEle.getAttribute("data-representative-postal-code");
            document.getElementById("editOrganizationRepresentative--representativePhoneNumber")
                .value = editRepresentativeTrEle.getAttribute("data-representative-phone-number");
            document.getElementById("editOrganizationRepresentative--representativePhoneNumber2")
                .value = editRepresentativeTrEle.getAttribute("data-representative-phone-number-2");
            document.getElementById("editOrganizationRepresentative--representativeEmailAddress")
                .value = editRepresentativeTrEle.getAttribute("data-representative-email-address");
            document.getElementById("editOrganizationRepresentative--isDefault").value =
                document.getElementById("representative-isDefault--" + representativeIndex).checked
                    ? "1"
                    : "0";
            cityssm.showModal(editRepresentativeModalElement);
        };
        const insertRepresentativeRowFn = (representativeObj) => {
            const trEle = document.createElement("tr");
            trEle.setAttribute("data-representative-index", representativeObj.representativeIndex.toString());
            trEle.setAttribute("data-representative-name", representativeObj.representativeName);
            trEle.setAttribute("data-representative-title", representativeObj.representativeTitle);
            trEle.setAttribute("data-representative-address-1", representativeObj.representativeAddress1);
            trEle.setAttribute("data-representative-address-2", representativeObj.representativeAddress2);
            trEle.setAttribute("data-representative-city", representativeObj.representativeCity);
            trEle.setAttribute("data-representative-province", representativeObj.representativeProvince);
            trEle.setAttribute("data-representative-postal-code", representativeObj.representativePostalCode);
            trEle.setAttribute("data-representative-phone-number", representativeObj.representativePhoneNumber);
            trEle.setAttribute("data-representative-phone-number-2", representativeObj.representativePhoneNumber2);
            trEle.setAttribute("data-representative-email-address", representativeObj.representativeEmailAddress);
            trEle.insertAdjacentHTML("beforeend", "<td>" +
                "<div class=\"field\">" +
                "<input class=\"is-checkradio is-info\"" +
                " id=\"representative-isDefault--" + representativeObj.representativeIndex.toString() + "\"" +
                " name=\"representative-isDefault\" type=\"radio\"" +
                (representativeObj.isDefault ? " checked" : "") + " />&nbsp;" +
                "<label for=\"representative-isDefault--" + representativeObj.representativeIndex.toString() + "\"></label>" +
                "</div>" +
                "</td>");
            trEle.getElementsByTagName("input")[0].addEventListener("change", updateDefaultRepresentativeFunction);
            let tdEle = document.createElement("td");
            tdEle.innerHTML = cityssm.escapeHTML(representativeObj.representativeName) + "<br />" +
                "<small>" + cityssm.escapeHTML(representativeObj.representativeTitle) + "</small>";
            trEle.insertAdjacentElement("beforeend", tdEle);
            tdEle = document.createElement("td");
            tdEle.innerHTML = cityssm.escapeHTML(representativeObj.representativeAddress1) + "<br />" +
                "<small>" +
                (representativeObj.representativeAddress2 === "" ? "" : cityssm.escapeHTML(representativeObj.representativeAddress2) + "<br />") +
                cityssm.escapeHTML(representativeObj.representativeCity) + ", " + cityssm.escapeHTML(representativeObj.representativeProvince) + "<br />" +
                cityssm.escapeHTML(representativeObj.representativePostalCode) +
                "</small>";
            trEle.insertAdjacentElement("beforeend", tdEle);
            tdEle = document.createElement("td");
            tdEle.innerHTML = cityssm.escapeHTML(representativeObj.representativePhoneNumber) + "<br />" +
                cityssm.escapeHTML(representativeObj.representativePhoneNumber2);
            trEle.insertAdjacentElement("beforeend", tdEle);
            tdEle = document.createElement("td");
            tdEle.innerHTML = cityssm.escapeHTML(representativeObj.representativeEmailAddress);
            trEle.insertAdjacentElement("beforeend", tdEle);
            trEle.insertAdjacentHTML("beforeend", "<td>" +
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
            trEle.getElementsByClassName("is-edit-representative-button")[0]
                .addEventListener("click", openEditRepresentativeModalFn);
            trEle.getElementsByClassName("is-delete-representative-button")[0]
                .addEventListener("click", deleteRepresentativeFunction);
            representativeTbodyElement.insertAdjacentElement("beforeend", trEle);
        };
        const editBtnEles = representativeTbodyElement.getElementsByClassName("is-edit-representative-button");
        for (const editBtnEle of editBtnEles) {
            editBtnEle.addEventListener("click", openEditRepresentativeModalFn);
        }
        let cancelButtonEles = editRepresentativeModalElement.getElementsByClassName("is-cancel-button");
        for (const cancelButtonEle of cancelButtonEles) {
            cancelButtonEle.addEventListener("click", cityssm.hideModal);
        }
        editRepresentativeFormEle.addEventListener("submit", (formEvent) => {
            formEvent.preventDefault();
            cityssm.postJSON(urlPrefix + "/organizations/" + organizationIDString + "/doEditOrganizationRepresentative", formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    editRepresentativeTrEle.remove();
                    editRepresentativeTrEle = null;
                    insertRepresentativeRowFn(responseJSON.organizationRepresentative);
                    cityssm.hideModal(editRepresentativeModalElement);
                }
            });
        });
        const addRepresentativeModalEle = document.getElementsByClassName("is-add-representative-modal")[0];
        const addRepresentativeFormEle = addRepresentativeModalEle.getElementsByTagName("form")[0];
        document.getElementsByClassName("is-add-representative-button")[0].addEventListener("click", () => {
            addRepresentativeFormEle.reset();
            cityssm.showModal(addRepresentativeModalEle);
            document.getElementById("addOrganizationRepresentative--representativeName").focus();
        });
        cancelButtonEles = addRepresentativeModalEle.getElementsByClassName("is-cancel-button");
        for (const cancelButtonEle of cancelButtonEles) {
            cancelButtonEle.addEventListener("click", cityssm.hideModal);
        }
        addRepresentativeFormEle.addEventListener("submit", (formEvent) => {
            formEvent.preventDefault();
            cityssm.postJSON(urlPrefix + "/organizations/" + organizationIDString + "/doAddOrganizationRepresentative", formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    const emptyWarningEle = representativeTbodyElement.getElementsByClassName("is-empty-warning");
                    if (emptyWarningEle.length > 0) {
                        emptyWarningEle[0].remove();
                    }
                    insertRepresentativeRowFn(responseJSON.organizationRepresentative);
                    cityssm.hideModal(addRepresentativeModalEle);
                }
            });
        });
        addRepresentativeModalEle.getElementsByClassName("is-copy-organization-address-button")[0]
            .addEventListener("click", (clickEvent) => {
            clickEvent.preventDefault();
            document.getElementById("addOrganizationRepresentative--representativeAddress1").value =
                document.getElementById("organization--organizationAddress1").value;
            document.getElementById("addOrganizationRepresentative--representativeAddress2").value =
                document.getElementById("organization--organizationAddress2").value;
            document.getElementById("addOrganizationRepresentative--representativeCity").value =
                document.getElementById("organization--organizationCity").value;
            document.getElementById("addOrganizationRepresentative--representativeProvince").value =
                document.getElementById("organization--organizationProvince").value;
            document.getElementById("addOrganizationRepresentative--representativePostalCode").value =
                document.getElementById("organization--organizationPostalCode").value;
        });
        const deleteReminderClickFn = (buttonEvent) => {
            buttonEvent.preventDefault();
            const buttonEle = buttonEvent.currentTarget;
            const reminderIndex = parseInt(buttonEle.getAttribute("data-reminder-index"), 10);
            llm.organizationReminders.deleteReminder(organizationID, reminderIndex, true, (responseJSON) => {
                if (responseJSON.success) {
                    buttonEle.closest("tr").remove();
                }
            });
        };
        const dismissReminderClickFn = (buttonEvent) => {
            buttonEvent.preventDefault();
            const buttonEle = buttonEvent.currentTarget;
            const reminderIndex = parseInt(buttonEle.getAttribute("data-reminder-index"), 10);
            llm.organizationReminders.dismissReminder(organizationID, reminderIndex, true, (responseJSON) => {
                if (responseJSON.success) {
                    llm.organizationReminders.loadReminderTypeCache(() => {
                        const oldTrEle = buttonEle.closest("tr");
                        const newTrEle = renderReminderAsTableRow(responseJSON.reminder);
                        oldTrEle.insertAdjacentElement("afterend", newTrEle);
                        oldTrEle.remove();
                    });
                }
            });
        };
        const editReminderClickFn = (buttonEvent) => {
            buttonEvent.preventDefault();
            const buttonEle = buttonEvent.currentTarget;
            const reminderIndex = parseInt(buttonEle.getAttribute("data-reminder-index"), 10);
            llm.organizationReminders.openEditReminderModal(organizationID, reminderIndex, (reminderObj) => {
                const oldTrEle = buttonEle.closest("tr");
                const newTrEle = renderReminderAsTableRow(reminderObj);
                oldTrEle.insertAdjacentElement("afterend", newTrEle);
                oldTrEle.remove();
            });
        };
        const renderReminderAsTableRow = (reminder) => {
            const reminderType = llm.organizationReminders.getReminderType(reminder.reminderTypeKey);
            const trEle = document.createElement("tr");
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
            trEle.innerHTML = ("<td>" +
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
                trEle.getElementsByClassName("is-dismiss-reminder-button")[0].addEventListener("click", dismissReminderClickFn);
            }
            trEle.getElementsByClassName("is-edit-reminder-button")[0].addEventListener("click", editReminderClickFn);
            trEle.getElementsByClassName("is-delete-reminder-button")[0].addEventListener("click", deleteReminderClickFn);
            return trEle;
        };
        document.getElementById("is-add-reminder-button").addEventListener("click", (clickEvent) => {
            clickEvent.preventDefault();
            llm.organizationReminders.openAddReminderModal(organizationID, (reminderObj) => {
                const trEle = renderReminderAsTableRow(reminderObj);
                document.getElementById("container--reminders").insertAdjacentElement("afterbegin", trEle);
            });
        });
        const dismissReminderButtonEles = document.getElementsByClassName("is-dismiss-reminder-button");
        for (const buttonEle of dismissReminderButtonEles) {
            buttonEle.addEventListener("click", dismissReminderClickFn);
        }
        const editReminderButtonEles = document.getElementsByClassName("is-edit-reminder-button");
        for (const buttonEle of editReminderButtonEles) {
            buttonEle.addEventListener("click", editReminderClickFn);
        }
        const deleteReminderButtonEles = document.getElementsByClassName("is-delete-reminder-button");
        for (const buttonEle of deleteReminderButtonEles) {
            buttonEle.addEventListener("click", deleteReminderClickFn);
        }
    }
    const setUnsavedChangesFn = () => {
        cityssm.enableNavBlocker();
        formMessageElement.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
            "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
            " <span>Unsaved Changes</span>" +
            "</div>";
    };
    const inputEles = formElement.querySelectorAll("input, select, textarea");
    for (const inputEle of inputEles) {
        inputEle.addEventListener("change", setUnsavedChangesFn);
    }
})();
