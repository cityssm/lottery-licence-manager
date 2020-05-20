"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var formEle = document.getElementById("form--organization");
    var formMessageEle = document.getElementById("container--form-message");
    var organizationID = document.getElementById("organization--organizationID").value;
    var isCreate = organizationID === "";
    formEle.addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
        formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";
        cityssm.postJSON("/organizations/doSave", formEle, function (responseJSON) {
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
        var deleteOrganizationFn_1 = function () {
            cityssm.postJSON("/organizations/doDelete", {
                organizationID: organizationID
            }, function (responseJSON) {
                if (responseJSON.success) {
                    window.location.href = "/organizations";
                }
            });
        };
        formEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", function () {
            cityssm.confirmModal("Delete Organization?", ("Are you sure you want to delete this organization?<br />" +
                "Note that any active licences issued to this organization will remain active."), "Yes, Delete Organization", "warning", deleteOrganizationFn_1);
        });
        var representativeTbodyEle_1 = document.getElementsByClassName("is-representative-table")[0].getElementsByTagName("tbody")[0];
        var showNoRepresentativesWarning_1 = function () {
            if (representativeTbodyEle_1.getElementsByTagName("tr").length === 0) {
                representativeTbodyEle_1.innerHTML = "<tr class=\"has-background-warning is-empty-warning\">" +
                    "<td class=\"has-text-centered\" colspan=\"6\">" +
                    "<strong>There are no representatives associated with this organization.</strong>" +
                    "</td>" +
                    "</tr>";
            }
        };
        showNoRepresentativesWarning_1();
        var updateDefaultRepresentativeFn_1 = function (changeEvent) {
            var defaultRepresentativeIndex = changeEvent.currentTarget.value;
            cityssm.postJSON("/organizations/" + organizationID + "/doSetDefaultRepresentative", {
                isDefaultRepresentativeIndex: defaultRepresentativeIndex
            }, function () {
            });
        };
        var radioEles = representativeTbodyEle_1.getElementsByTagName("input");
        for (var eleIndex = 0; eleIndex < radioEles.length; eleIndex += 1) {
            radioEles[eleIndex].addEventListener("change", updateDefaultRepresentativeFn_1);
        }
        var deleteRepresentativeFn_1 = function (clickEvent) {
            clickEvent.preventDefault();
            var trEle = clickEvent.currentTarget.closest("tr");
            var representativeName = trEle.getAttribute("data-representative-name");
            cityssm.confirmModal("Delete a Representative?", "<p>Are you sure you want to delete the representative \"" + representativeName + "\"?</p>", "Yes, Delete", "danger", function () {
                cityssm.postJSON("/organizations/" + organizationID + "/doDeleteOrganizationRepresentative", {
                    representativeIndex: trEle.getAttribute("data-representative-index")
                }, function (responseJSON) {
                    if (responseJSON.success) {
                        trEle.remove();
                        showNoRepresentativesWarning_1();
                    }
                });
            });
        };
        var deleteBtnEles = representativeTbodyEle_1.getElementsByClassName("is-delete-representative-button");
        for (var eleIndex = 0; eleIndex < deleteBtnEles.length; eleIndex += 1) {
            deleteBtnEles[eleIndex].addEventListener("click", deleteRepresentativeFn_1);
        }
        var editRepresentativeModalEle_1 = document.getElementsByClassName("is-edit-representative-modal")[0];
        var editRepresentativeFormEle = editRepresentativeModalEle_1.getElementsByTagName("form")[0];
        var editRepresentativeTrEle_1;
        var openEditRepresentativeModalFn_1 = function (clickEvent) {
            editRepresentativeTrEle_1 = clickEvent.currentTarget.closest("tr");
            var representativeIndex = editRepresentativeTrEle_1.getAttribute("data-representative-index");
            document.getElementById("editOrganizationRepresentative--representativeIndex").value = representativeIndex;
            document.getElementById("editOrganizationRepresentative--representativeName").value =
                editRepresentativeTrEle_1.getAttribute("data-representative-name");
            document.getElementById("editOrganizationRepresentative--representativeTitle").value =
                editRepresentativeTrEle_1.getAttribute("data-representative-title");
            document.getElementById("editOrganizationRepresentative--representativeAddress1").value =
                editRepresentativeTrEle_1.getAttribute("data-representative-address-1");
            document.getElementById("editOrganizationRepresentative--representativeAddress2").value =
                editRepresentativeTrEle_1.getAttribute("data-representative-address-2");
            document.getElementById("editOrganizationRepresentative--representativeCity").value =
                editRepresentativeTrEle_1.getAttribute("data-representative-city");
            document.getElementById("editOrganizationRepresentative--representativeProvince").value =
                editRepresentativeTrEle_1.getAttribute("data-representative-province");
            document.getElementById("editOrganizationRepresentative--representativePostalCode").value =
                editRepresentativeTrEle_1.getAttribute("data-representative-postal-code");
            document.getElementById("editOrganizationRepresentative--representativePhoneNumber").value =
                editRepresentativeTrEle_1.getAttribute("data-representative-phone-number");
            document.getElementById("editOrganizationRepresentative--representativeEmailAddress").value =
                editRepresentativeTrEle_1.getAttribute("data-representative-email-address");
            document.getElementById("editOrganizationRepresentative--isDefault").value =
                document.getElementById("representative-isDefault--" + representativeIndex).checked ? "1" : "0";
            cityssm.showModal(editRepresentativeModalEle_1);
        };
        var insertRepresentativeRowFn_1 = function (representativeObj) {
            var trEle = document.createElement("tr");
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
                "<input class=\"is-checkradio is-info\" id=\"representative-isDefault--" + representativeObj.representativeIndex + "\" name=\"representative-isDefault\" type=\"radio\"" + (representativeObj.isDefault ? " checked" : "") + " />&nbsp;" +
                "<label for=\"representative-isDefault--" + representativeObj.representativeIndex + "\"></label>" +
                "</div>" +
                "</td>");
            trEle.getElementsByTagName("input")[0].addEventListener("change", updateDefaultRepresentativeFn_1);
            var tdEle = document.createElement("td");
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
                .addEventListener("click", openEditRepresentativeModalFn_1);
            trEle.getElementsByClassName("is-delete-representative-button")[0]
                .addEventListener("click", deleteRepresentativeFn_1);
            representativeTbodyEle_1.insertAdjacentElement("beforeend", trEle);
        };
        var editBtnEles = representativeTbodyEle_1.getElementsByClassName("is-edit-representative-button");
        for (var eleIndex = 0; eleIndex < editBtnEles.length; eleIndex += 1) {
            editBtnEles[eleIndex].addEventListener("click", openEditRepresentativeModalFn_1);
        }
        var cancelButtonEles = editRepresentativeModalEle_1.getElementsByClassName("is-cancel-button");
        for (var buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
            cancelButtonEles[buttonIndex].addEventListener("click", cityssm.hideModal);
        }
        editRepresentativeFormEle.addEventListener("submit", function (formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON("/organizations/" + organizationID + "/doEditOrganizationRepresentative", formEvent.currentTarget, function (responseJSON) {
                if (responseJSON.success) {
                    editRepresentativeTrEle_1.remove();
                    editRepresentativeTrEle_1 = null;
                    insertRepresentativeRowFn_1(responseJSON.organizationRepresentative);
                    cityssm.hideModal(editRepresentativeModalEle_1);
                }
            });
        });
        var addRepresentativeModalEle_1 = document.getElementsByClassName("is-add-representative-modal")[0];
        var addRepresentativeFormEle_1 = addRepresentativeModalEle_1.getElementsByTagName("form")[0];
        document.getElementsByClassName("is-add-representative-button")[0].addEventListener("click", function () {
            addRepresentativeFormEle_1.reset();
            cityssm.showModal(addRepresentativeModalEle_1);
            document.getElementById("addOrganizationRepresentative--representativeName").focus();
        });
        cancelButtonEles = addRepresentativeModalEle_1.getElementsByClassName("is-cancel-button");
        for (var buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
            cancelButtonEles[buttonIndex].addEventListener("click", cityssm.hideModal);
        }
        addRepresentativeFormEle_1.addEventListener("submit", function (formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON("/organizations/" + organizationID + "/doAddOrganizationRepresentative", formEvent.currentTarget, function (responseJSON) {
                if (responseJSON.success) {
                    var emptyWarningEle = representativeTbodyEle_1.getElementsByClassName("is-empty-warning");
                    if (emptyWarningEle.length > 0) {
                        emptyWarningEle[0].remove();
                    }
                    insertRepresentativeRowFn_1(responseJSON.organizationRepresentative);
                    cityssm.hideModal(addRepresentativeModalEle_1);
                }
            });
        });
        addRepresentativeModalEle_1.getElementsByClassName("is-copy-organization-address-button")[0]
            .addEventListener("click", function (clickEvent) {
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
    function setUnsavedChanges() {
        cityssm.enableNavBlocker();
        formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
            "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
            " <span>Unsaved Changes</span>" +
            "</div>";
    }
    var inputEles = formEle.querySelectorAll("input, select, textarea");
    for (var inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
        inputEles[inputIndex].addEventListener("change", setUnsavedChanges);
    }
}());
