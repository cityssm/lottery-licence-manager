"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var eventDateNavEle = document.getElementById("eventNav--eventDate");
    var formEle = document.getElementById("form--event");
    var formMessageEle = document.getElementById("container--form-message");
    var licenceID = document.getElementById("event--licenceID").value;
    var eventDate = document.getElementById("event--eventDate").value;
    formEle.addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
        formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";
        cityssm.postJSON("/events/doSave", formEle, function (responseJSON) {
            if (responseJSON.success) {
                cityssm.disableNavBlocker();
                if (eventDateNavEle) {
                    eventDateNavEle.removeAttribute("disabled");
                }
            }
            formMessageEle.innerHTML = "";
            cityssm.alertModal(responseJSON.message, "", "OK", responseJSON.success ? "success" : "danger");
        });
    });
    document.getElementById("is-delete-event-button").addEventListener("click", function (clickEvent) {
        clickEvent.preventDefault();
        cityssm.confirmModal("Delete Event?", "Are you sure you want to delete this event?", "Yes, Delete", "danger", function () {
            cityssm.postJSON("/events/doDelete", {
                licenceID: licenceID,
                eventDate: eventDate
            }, function (responseJSON) {
                if (responseJSON.success) {
                    cityssm.disableNavBlocker();
                    window.location.href = "/licences/" + licenceID;
                }
            });
        });
    });
    function setUnsavedChanges() {
        cityssm.enableNavBlocker();
        if (eventDateNavEle) {
            eventDateNavEle.setAttribute("disabled", "disabled");
        }
        formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
            "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
            " <span>Unsaved Changes</span>" +
            "</div>";
    }
    var inputEles = formEle.querySelectorAll("input, select, textarea");
    for (var inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
        if (inputEles[inputIndex].name !== "") {
            inputEles[inputIndex].addEventListener("change", setUnsavedChanges);
        }
    }
    document.getElementById("is-bank-information-lookup-button").addEventListener("click", function (clickEvent) {
        clickEvent.preventDefault();
        var bankInfoCloseModalFn;
        var savedBankInfoList;
        var setPastBankInformation = function (bankInfoClickEvent) {
            bankInfoClickEvent.preventDefault();
            var listIndex = parseInt(bankInfoClickEvent.currentTarget.getAttribute("data-list-index"));
            var record = savedBankInfoList[listIndex];
            document.getElementById("event--bank_name").value = record.bank_name;
            document.getElementById("event--bank_address").value = record.bank_address;
            document.getElementById("event--bank_accountNumber").value = record.bank_accountNumber;
            setUnsavedChanges();
            bankInfoCloseModalFn();
        };
        var getPastBankInformation = function () {
            var containerEle = document.getElementById("container--bankInformationLookup");
            cityssm.postJSON("/events/doGetPastBankInformation", {
                licenceID: licenceID
            }, function (bankInfoList) {
                savedBankInfoList = bankInfoList;
                var listEle = document.createElement("div");
                listEle.className = "list is-hoverable mb-3";
                for (var index = 0; index < bankInfoList.length; index += 1) {
                    var record = bankInfoList[index];
                    var listItemEle = document.createElement("a");
                    listItemEle.className = "list-item";
                    listItemEle.setAttribute("data-list-index", index.toString());
                    listItemEle.innerHTML = "<div class=\"columns\">" +
                        "<div class=\"column\">" + cityssm.escapeHTML(record.bank_name) + "</div>" +
                        "<div class=\"column\">" + cityssm.escapeHTML(record.bank_address) + "</div>" +
                        "<div class=\"column\">" + cityssm.escapeHTML(record.bank_accountNumber) + "</div>" +
                        "</div>" +
                        "<div class=\"has-text-right\">" +
                        "<span class=\"tag is-info\" data-tooltip=\"Last Used Event Date\">" +
                        record.eventDateMaxString +
                        "</span>" +
                        "</div>";
                    listItemEle.addEventListener("click", setPastBankInformation);
                    listEle.insertAdjacentElement("beforeend", listItemEle);
                }
                cityssm.clearElement(containerEle);
                containerEle.insertAdjacentElement("beforeend", listEle);
            });
        };
        cityssm.openHtmlModal("event-bankInformationLookup", {
            onshow: getPastBankInformation,
            onshown: function (_modalEle, closeModalFn) {
                bankInfoCloseModalFn = closeModalFn;
            }
        });
    });
    var costs_receipts_ele = document.getElementById("event--costs_receipts");
    var costs_admin_ele = document.getElementById("event--costs_admin");
    var costs_prizesAwarded_ele = document.getElementById("event--costs_prizesAwarded");
    var costs_netProceeds_ele = document.getElementById("event--costs_netProceeds");
    var costs_amountDonated_ele = document.getElementById("event--costs_amountDonated");
    function refreshNetProceeds() {
        var netProceeds = (parseFloat(costs_receipts_ele.value || "0") -
            parseFloat(costs_admin_ele.value || "0") -
            parseFloat(costs_prizesAwarded_ele.value || "0")).toFixed(2);
        costs_netProceeds_ele.value = netProceeds;
        costs_amountDonated_ele.setAttribute("max", netProceeds);
    }
    costs_receipts_ele.addEventListener("keyup", refreshNetProceeds);
    costs_admin_ele.addEventListener("keyup", refreshNetProceeds);
    costs_prizesAwarded_ele.addEventListener("keyup", refreshNetProceeds);
}());
