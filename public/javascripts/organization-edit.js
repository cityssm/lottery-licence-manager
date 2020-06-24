"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const formEle = document.getElementById("form--organization");
    const formMessageEle = document.getElementById("container--form-message");
    const organizationID = document.getElementById("organization--organizationID").value;
    const isCreate = organizationID === "";
    formEle.addEventListener("submit", (formEvent) => {
        formEvent.preventDefault();
        formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";
        cityssm.postJSON("/organizations/doSave", formEle, (responseJSON) => {
            if (responseJSON.success) {
                cityssm.disableNavBlocker();
            }
            if (responseJSON.success && isCreate) {
                window.location.href = "/organizations/" + responseJSON.organizationID + "/edit";
            }
            else {
                formMessageEle.innerHTML = "";
                cityssm.alertModal(responseJSON.message, "", "OK", responseJSON.success ? "success" : "danger");
            }
        });
    });
    if (!isCreate) {
        const deleteOrganizationFn = () => {
            cityssm.postJSON("/organizations/doDelete", {
                organizationID: organizationID
            }, (responseJSON) => {
                if (responseJSON.success) {
                    window.location.href = "/organizations";
                }
            });
        };
        formEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", () => {
            cityssm.confirmModal("Delete Organization?", ("Are you sure you want to delete this organization?<br />" +
                "Note that any active licences issued to this organization will remain active."), "Yes, Delete Organization", "warning", deleteOrganizationFn);
        });
        const representativeTbodyEle = document.getElementsByClassName("is-representative-table")[0].getElementsByTagName("tbody")[0];
        const showNoRepresentativesWarning = () => {
            if (representativeTbodyEle.getElementsByTagName("tr").length === 0) {
                representativeTbodyEle.innerHTML = "<tr class=\"has-background-warning is-empty-warning\">" +
                    "<td class=\"has-text-centered\" colspan=\"6\">" +
                    "<strong>There are no representatives associated with this organization.</strong>" +
                    "</td>" +
                    "</tr>";
            }
        };
        showNoRepresentativesWarning();
        const updateDefaultRepresentativeFn = (changeEvent) => {
            const defaultRepresentativeIndex = changeEvent.currentTarget.value;
            cityssm.postJSON("/organizations/" + organizationID + "/doSetDefaultRepresentative", {
                isDefaultRepresentativeIndex: defaultRepresentativeIndex
            }, () => { });
        };
        const radioEles = representativeTbodyEle.getElementsByTagName("input");
        for (const radioEle of radioEles) {
            radioEle.addEventListener("change", updateDefaultRepresentativeFn);
        }
        const deleteRepresentativeFn = (clickEvent) => {
            clickEvent.preventDefault();
            const trEle = clickEvent.currentTarget.closest("tr");
            const representativeName = trEle.getAttribute("data-representative-name");
            cityssm.confirmModal("Delete a Representative?", "<p>Are you sure you want to delete the representative \"" + representativeName + "\"?</p>", "Yes, Delete", "danger", () => {
                cityssm.postJSON("/organizations/" + organizationID + "/doDeleteOrganizationRepresentative", {
                    representativeIndex: trEle.getAttribute("data-representative-index")
                }, (responseJSON) => {
                    if (responseJSON.success) {
                        trEle.remove();
                        showNoRepresentativesWarning();
                    }
                });
            });
        };
        const deleteBtnEles = representativeTbodyEle.getElementsByClassName("is-delete-representative-button");
        for (const deleteBtnEle of deleteBtnEles) {
            deleteBtnEle.addEventListener("click", deleteRepresentativeFn);
        }
        const editRepresentativeModalEle = document.getElementsByClassName("is-edit-representative-modal")[0];
        const editRepresentativeFormEle = editRepresentativeModalEle.getElementsByTagName("form")[0];
        let editRepresentativeTrEle;
        const openEditRepresentativeModalFn = (clickEvent) => {
            editRepresentativeTrEle = clickEvent.currentTarget.closest("tr");
            const representativeIndex = editRepresentativeTrEle.getAttribute("data-representative-index");
            document.getElementById("editOrganizationRepresentative--representativeIndex").value = representativeIndex;
            document.getElementById("editOrganizationRepresentative--representativeName").value =
                editRepresentativeTrEle.getAttribute("data-representative-name");
            document.getElementById("editOrganizationRepresentative--representativeTitle").value =
                editRepresentativeTrEle.getAttribute("data-representative-title");
            document.getElementById("editOrganizationRepresentative--representativeAddress1").value =
                editRepresentativeTrEle.getAttribute("data-representative-address-1");
            document.getElementById("editOrganizationRepresentative--representativeAddress2").value =
                editRepresentativeTrEle.getAttribute("data-representative-address-2");
            document.getElementById("editOrganizationRepresentative--representativeCity").value =
                editRepresentativeTrEle.getAttribute("data-representative-city");
            document.getElementById("editOrganizationRepresentative--representativeProvince").value =
                editRepresentativeTrEle.getAttribute("data-representative-province");
            document.getElementById("editOrganizationRepresentative--representativePostalCode").value =
                editRepresentativeTrEle.getAttribute("data-representative-postal-code");
            document.getElementById("editOrganizationRepresentative--representativePhoneNumber").value =
                editRepresentativeTrEle.getAttribute("data-representative-phone-number");
            document.getElementById("editOrganizationRepresentative--representativeEmailAddress").value =
                editRepresentativeTrEle.getAttribute("data-representative-email-address");
            document.getElementById("editOrganizationRepresentative--isDefault").value =
                document.getElementById("representative-isDefault--" + representativeIndex).checked ? "1" : "0";
            cityssm.showModal(editRepresentativeModalEle);
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
            trEle.setAttribute("data-representative-email-address", representativeObj.representativeEmailAddress);
            trEle.insertAdjacentHTML("beforeend", "<td>" +
                "<div class=\"field\">" +
                "<input class=\"is-checkradio is-info\"" +
                " id=\"representative-isDefault--" + representativeObj.representativeIndex + "\"" +
                " name=\"representative-isDefault\" type=\"radio\"" +
                (representativeObj.isDefault ? " checked" : "") + " />&nbsp;" +
                "<label for=\"representative-isDefault--" + representativeObj.representativeIndex + "\"></label>" +
                "</div>" +
                "</td>");
            trEle.getElementsByTagName("input")[0].addEventListener("change", updateDefaultRepresentativeFn);
            let tdEle = document.createElement("td");
            tdEle.innerHTML = representativeObj.representativeName + "<br />" +
                "<small>" + representativeObj.representativeTitle + "</small>";
            trEle.insertAdjacentElement("beforeend", tdEle);
            tdEle = document.createElement("td");
            tdEle.innerHTML = representativeObj.representativeAddress1 + "<br />" +
                "<small>" +
                (representativeObj.representativeAddress2 === "" ? "" : representativeObj.representativeAddress2 + "<br />") +
                representativeObj.representativeCity + ", " + representativeObj.representativeProvince + "<br />" +
                representativeObj.representativePostalCode +
                "</small>";
            trEle.insertAdjacentElement("beforeend", tdEle);
            tdEle = document.createElement("td");
            tdEle.innerHTML = representativeObj.representativePhoneNumber;
            trEle.insertAdjacentElement("beforeend", tdEle);
            tdEle = document.createElement("td");
            tdEle.innerHTML = representativeObj.representativeEmailAddress;
            trEle.insertAdjacentElement("beforeend", tdEle);
            trEle.insertAdjacentHTML("beforeend", "<td>" +
                "<div class=\"buttons is-right has-addons\">" +
                "<button class=\"button is-small is-edit-representative-button\" data-tooltip=\"Edit Representative\" type=\"button\">" +
                "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                "<span>Edit</span></button>" +
                "<button class=\"button is-small has-text-danger is-delete-representative-button\" data-tooltip=\"Delete Representative\" type=\"button\">" +
                "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
                "<span class=\"sr-only\">Delete</span>" +
                "</button>" +
                "</td>");
            trEle.getElementsByClassName("is-edit-representative-button")[0]
                .addEventListener("click", openEditRepresentativeModalFn);
            trEle.getElementsByClassName("is-delete-representative-button")[0]
                .addEventListener("click", deleteRepresentativeFn);
            representativeTbodyEle.insertAdjacentElement("beforeend", trEle);
        };
        const editBtnEles = representativeTbodyEle.getElementsByClassName("is-edit-representative-button");
        for (const editBtnEle of editBtnEles) {
            editBtnEle.addEventListener("click", openEditRepresentativeModalFn);
        }
        let cancelButtonEles = editRepresentativeModalEle.getElementsByClassName("is-cancel-button");
        for (const cancelButtonEle of cancelButtonEles) {
            cancelButtonEle.addEventListener("click", cityssm.hideModal);
        }
        editRepresentativeFormEle.addEventListener("submit", (formEvent) => {
            formEvent.preventDefault();
            cityssm.postJSON("/organizations/" + organizationID + "/doEditOrganizationRepresentative", formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    editRepresentativeTrEle.remove();
                    editRepresentativeTrEle = null;
                    insertRepresentativeRowFn(responseJSON.organizationRepresentative);
                    cityssm.hideModal(editRepresentativeModalEle);
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
            cityssm.postJSON("/organizations/" + organizationID + "/doAddOrganizationRepresentative", formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    const emptyWarningEle = representativeTbodyEle.getElementsByClassName("is-empty-warning");
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
    }
    const setUnsavedChangesFn = () => {
        cityssm.enableNavBlocker();
        formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
            "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
            " <span>Unsaved Changes</span>" +
            "</div>";
    };
    const inputEles = formEle.querySelectorAll("input, select, textarea");
    for (const inputEle of inputEles) {
        inputEle.addEventListener("change", setUnsavedChangesFn);
    }
})();
