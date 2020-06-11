"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var canCreate = document.getElementsByTagName("main")[0].getAttribute("data-can-create") === "true";
    var remarksContainerEle = document.getElementById("container--remarks");
    if (canCreate) {
        var organizationID_1 = parseInt(remarksContainerEle.getAttribute("data-organization-id"));
        var refreshRemarksFn_1;
        var editRemarkFn_1 = function (buttonEvent) {
            var remarkIndex = parseInt(buttonEvent.currentTarget.getAttribute("data-remark-index"));
            llm.organizationRemarks.openEditRemarkModal(organizationID_1, remarkIndex, refreshRemarksFn_1);
        };
        var deleteRemarkFn_1 = function (buttonEvent) {
            var remarkIndex = parseInt(buttonEvent.currentTarget.getAttribute("data-remark-index"));
            llm.organizationRemarks.deleteRemark(organizationID_1, remarkIndex, true, refreshRemarksFn_1);
        };
        refreshRemarksFn_1 = function () {
            llm.organizationRemarks.getRemarksByOrganizationID(organizationID_1, function (remarkList) {
                cityssm.clearElement(remarksContainerEle);
                if (remarkList.length === 0) {
                    remarksContainerEle.innerHTML = "<div class=\"panel-block\">" +
                        "<div class=\"message is-info\">" +
                        "<p class=\"message-body\">There are no remarks associated with this organization.</p>" +
                        "</div>" +
                        "</div>";
                }
                else {
                    for (var remarkIndex = 0; remarkIndex < remarkList.length; remarkIndex += 1) {
                        var remark = remarkList[remarkIndex];
                        remarksContainerEle.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
                            "<div class=\"columns is-mobile\">" +
                            "<div class=\"column is-narrow\">" +
                            (remark.isImportant ?
                                "<i class=\"fas fa-fw fa-star\" aria-hidden=\"true\"></i>" :
                                "<i class=\"far fa-fw fa-comment\" aria-hidden=\"true\"></i>") +
                            "</div>" +
                            "<div class=\"column\">" +
                            "<p class=\"has-newline-chars\">" + cityssm.escapeHTML(remark.remark) + "</p>" +
                            "<p class=\"is-size-7\">" +
                            (remark.recordCreate_timeMillis === remark.recordUpdate_timeMillis ? "" : "<i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i> ") +
                            remark.recordUpdate_userName + " - " + remark.remarkDateString + " " + remark.remarkTimeString +
                            "</p>" +
                            "</div>" +
                            (remark.canUpdate ?
                                "<div class=\"column is-narrow\">" +
                                    "<div class=\"buttons is-right has-addons\">" +
                                    "<button class=\"button is-small is-edit-remark-button\" data-remark-index=\"" + remark.remarkIndex + "\" data-tooltip=\"Edit Remark\" type=\"button\">" +
                                    "<span class=\"icon is-small\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                                    "<span>Edit</span>" +
                                    "</button>" +
                                    "<button class=\"button is-small has-text-danger is-delete-remark-button\" data-remark-index=\"" + remark.remarkIndex + "\" data-tooltip=\"Delete Remark\" type=\"button\">" +
                                    "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
                                    "<span class=\"sr-only\">Delete</span>" +
                                    "</button>" +
                                    "</div>" +
                                    "</div>" :
                                "") +
                            "</div>" +
                            "</div>");
                    }
                    var editBtnEles_1 = remarksContainerEle.getElementsByClassName("is-edit-remark-button");
                    for (var btnIndex = 0; btnIndex < editBtnEles_1.length; btnIndex += 1) {
                        editBtnEles_1[btnIndex].addEventListener("click", editRemarkFn_1);
                    }
                    var deleteBtnEles_1 = remarksContainerEle.getElementsByClassName("is-delete-remark-button");
                    for (var btnIndex = 0; btnIndex < deleteBtnEles_1.length; btnIndex += 1) {
                        deleteBtnEles_1[btnIndex].addEventListener("click", deleteRemarkFn_1);
                    }
                }
            });
        };
        document.getElementsByClassName("is-add-remark-button")[0].addEventListener("click", function (clickEvent) {
            clickEvent.preventDefault();
            llm.organizationRemarks.openAddRemarkModal(organizationID_1, refreshRemarksFn_1);
        });
        var editBtnEles = remarksContainerEle.getElementsByClassName("is-edit-remark-button");
        for (var btnIndex = 0; btnIndex < editBtnEles.length; btnIndex += 1) {
            editBtnEles[btnIndex].addEventListener("click", editRemarkFn_1);
        }
        var deleteBtnEles = remarksContainerEle.getElementsByClassName("is-delete-remark-button");
        for (var btnIndex = 0; btnIndex < deleteBtnEles.length; btnIndex += 1) {
            deleteBtnEles[btnIndex].addEventListener("click", deleteRemarkFn_1);
        }
    }
    var remarkSearchStrEle = document.getElementById("remark--searchStr");
    if (remarkSearchStrEle) {
        remarkSearchStrEle.value = "";
        var remarkDisplayCountEle_1 = document.getElementById("remark--displayCount");
        var remarkBlockEles_1 = remarksContainerEle.getElementsByClassName("is-remark-block");
        remarkSearchStrEle.addEventListener("keyup", function () {
            var searchStrSplit = remarkSearchStrEle.value
                .trim()
                .toLowerCase()
                .split(" ");
            var displayCount = remarkBlockEles_1.length;
            for (var remarkBlockIndex = 0; remarkBlockIndex < remarkBlockEles_1.length; remarkBlockIndex += 1) {
                var remark = remarkBlockEles_1[remarkBlockIndex].getElementsByClassName("is-remark")[0].innerText
                    .trim()
                    .toLowerCase();
                var showRemark = true;
                for (var searchStrIndex = 0; searchStrIndex < searchStrSplit.length; searchStrIndex += 1) {
                    if (remark.indexOf(searchStrSplit[searchStrIndex]) === -1) {
                        showRemark = false;
                        displayCount -= 1;
                        break;
                    }
                }
                if (showRemark) {
                    remarkBlockEles_1[remarkBlockIndex].classList.remove("is-hidden");
                }
                else {
                    remarkBlockEles_1[remarkBlockIndex].classList.add("is-hidden");
                }
            }
            remarkDisplayCountEle_1.innerText = displayCount.toString();
        });
    }
    var bankRecordsFiltersLoaded = false;
    var bankRecordsCache = {};
    var bankRecordsBankingYearFilterEle = document.getElementById("bankRecordFilter--bankingYear");
    var bankRecordsAccountNumberFilterEle = document.getElementById("bankRecordFilter--accountNumber");
    var bankRecordsTableEle = document.getElementById("table--bankRecords");
    var organizationID = bankRecordsTableEle.getAttribute("data-organization-id");
    function clearBankRecordsTable() {
        bankRecordsCache = {};
        bankRecordsTableEle.classList.remove("has-status-loaded");
        bankRecordsTableEle.classList.add("has-status-loading");
        var buttonEles = bankRecordsTableEle.getElementsByClassName("is-bank-record-button");
        for (var index = 0; index < buttonEles.length; index += 1) {
            var buttonEle = buttonEles[index];
            buttonEle.classList.remove("is-success");
            buttonEle.classList.remove("is-info");
            buttonEle.innerHTML = "<span class=\"icon\">" +
                "<i class=\"fas fa-minus has-text-grey-lighter\" aria-hidden=\"true\"></i>" +
                "</span><br />" +
                "<small>No Record Recorded</small>";
            buttonEle.setAttribute("data-record-index", "");
        }
    }
    function getBankRecords() {
        clearBankRecordsTable();
        var processRecordsFn = function (bankRecords) {
            for (var recordIndex = 0; recordIndex < bankRecords.length; recordIndex += 1) {
                var bankRecord = bankRecords[recordIndex];
                bankRecordsCache[bankRecord.recordIndex] = bankRecord;
                var buttonEle = bankRecordsTableEle
                    .querySelector("[data-banking-month='" + bankRecord.bankingMonth + "']")
                    .querySelector("[data-bank-record-type='" + bankRecord.bankRecordType + "']");
                if (!buttonEle) {
                    continue;
                }
                buttonEle.setAttribute("data-record-index", bankRecord.recordIndex.toString());
                if (bankRecord.recordIsNA) {
                    buttonEle.classList.add("is-info");
                    buttonEle.innerHTML =
                        "<i class=\"fas fa-times\" aria-hidden=\"true\"></i>" +
                            "<br />" +
                            "<small>Not Applicable</small>" +
                            (bankRecord.recordNote === "" ?
                                "" :
                                " <span class=\"ml-2\" data-tooltip=\"" + cityssm.escapeHTML(bankRecord.recordNote) + "\">" +
                                    "<i class=\"fas fa-sticky-note\" aria-hidden=\"true\"></i>" +
                                    "</span>");
                }
                else {
                    buttonEle.classList.add("is-success");
                    buttonEle.innerHTML =
                        "<i class=\"fas fa-check\" aria-hidden=\"true\"></i>" +
                            "<br />" +
                            "<small>Recorded " + bankRecord.recordDateString + "</small>" +
                            (bankRecord.recordNote === "" ?
                                "" :
                                " <span class=\"ml-2\" data-tooltip=\"" + cityssm.escapeHTML(bankRecord.recordNote) + "\">" +
                                    "<i class=\"fas fa-sticky-note\" aria-hidden=\"true\"></i>" +
                                    "</span>");
                }
            }
            bankRecordsTableEle.classList.remove("has-status-loading");
            bankRecordsTableEle.classList.add("has-status-loaded");
        };
        if (bankRecordsAccountNumberFilterEle.value === "") {
            processRecordsFn([]);
        }
        else {
            cityssm.postJSON("/organizations/doGetBankRecords", {
                organizationID: organizationID,
                bankingYear: bankRecordsBankingYearFilterEle.value,
                accountNumber: bankRecordsAccountNumberFilterEle.value
            }, processRecordsFn);
        }
    }
    function loadBankRecordFilters() {
        cityssm.postJSON("/organizations/doGetBankRecordStats", {
            organizationID: organizationID
        }, function (bankRecordStats) {
            var currentYear = new Date().getFullYear();
            var bankingYearMin = currentYear - 1;
            if (bankRecordStats.length === 0) {
                bankRecordsAccountNumberFilterEle.innerHTML = "<option value=\"\">(No Accounts Recorded)</option>";
            }
            else {
                bankRecordsAccountNumberFilterEle.innerHTML = "";
                for (var index = 0; index < bankRecordStats.length; index += 1) {
                    var bankRecordsStat = bankRecordStats[index];
                    bankingYearMin = Math.min(bankRecordsStat.bankingYearMin, bankingYearMin);
                    var accountNumber = cityssm.escapeHTML(bankRecordsStat.accountNumber);
                    bankRecordsAccountNumberFilterEle.insertAdjacentHTML("beforeend", "<option value=\"" + accountNumber + "\">" +
                        accountNumber + " (From " + bankRecordsStat.bankingYearMin + " to " + bankRecordsStat.bankingYearMax + ")" +
                        "</option>");
                }
            }
            bankRecordsBankingYearFilterEle.innerHTML = "";
            for (var year = currentYear; year >= bankingYearMin; year -= 1) {
                bankRecordsBankingYearFilterEle.insertAdjacentHTML("beforeend", "<option value=\"" + year + "\">" +
                    year +
                    "</option>");
            }
            getBankRecords();
        });
    }
    bankRecordsBankingYearFilterEle.addEventListener("change", getBankRecords);
    bankRecordsAccountNumberFilterEle.addEventListener("change", getBankRecords);
    if (canCreate) {
        var openBankRecordEditModal = function (buttonEvent) {
            var bankRecordEditCloseModalFn;
            var isUpdate = false;
            var lockKeyFields = false;
            var accountNumberIsBlank = true;
            var submitBankRecordEditFn = function (formEvent) {
                formEvent.preventDefault();
                cityssm.postJSON("/organizations/" + (isUpdate ? "doEditBankRecord" : "doAddBankRecord"), formEvent.currentTarget, function (resultJSON) {
                    if (resultJSON.success) {
                        bankRecordEditCloseModalFn();
                        if (isUpdate || (lockKeyFields && !accountNumberIsBlank)) {
                            getBankRecords();
                        }
                        else {
                            bankRecordsFiltersLoaded = false;
                            loadBankRecordFilters();
                        }
                    }
                    else {
                        cityssm.alertModal("Record Not Saved", resultJSON.message, "OK", "danger");
                    }
                });
            };
            var deleteBankRecordFn = function (deleteButtonEvent) {
                deleteButtonEvent.preventDefault();
                var recordIndex = deleteButtonEvent.currentTarget.getAttribute("data-record-index");
                var deleteFn = function () {
                    cityssm.postJSON("/organizations/doDeleteBankRecord", {
                        organizationID: organizationID,
                        recordIndex: recordIndex
                    }, function () {
                        bankRecordEditCloseModalFn();
                        getBankRecords();
                    });
                };
                cityssm.confirmModal("Delete Bank Record?", "Are you sure you want to delete this bank record?", "Yes, Delete", "warning", deleteFn);
            };
            var buttonEle = buttonEvent.currentTarget;
            var recordIndex = "";
            var accountNumber = bankRecordsAccountNumberFilterEle.value;
            accountNumberIsBlank = (accountNumber === "");
            var bankRecordType = "";
            var recordIsNA = false;
            var recordNote = "";
            var dateObj = new Date();
            var currentYear = dateObj.getFullYear();
            var currentDateString = cityssm.dateToString(dateObj);
            var recordDateString = currentDateString;
            dateObj.setMonth(dateObj.getMonth() - 1);
            var bankingYear = dateObj.getFullYear();
            var bankingMonth = dateObj.getMonth() + 1;
            if (buttonEle.id !== "is-add-bank-record-button") {
                lockKeyFields = true;
                recordIndex = buttonEle.getAttribute("data-record-index");
                bankingYear = parseInt(bankRecordsBankingYearFilterEle.value);
                if (recordIndex === "") {
                    bankingMonth = parseInt(buttonEle.closest("tr").getAttribute("data-banking-month"));
                    bankRecordType = buttonEle.getAttribute("data-bank-record-type");
                }
                else {
                    var recordObj = bankRecordsCache[parseInt(recordIndex)];
                    isUpdate = true;
                    bankingMonth = recordObj.bankingMonth;
                    bankRecordType = recordObj.bankRecordType;
                    recordIsNA = recordObj.recordIsNA;
                    recordDateString = recordObj.recordDateString;
                    recordNote = recordObj.recordNote;
                }
            }
            cityssm.openHtmlModal("organization-bankRecordEdit", {
                onshow: function () {
                    document.getElementById("bankRecordEdit--organizationID").value = organizationID;
                    document.getElementById("bankRecordEdit--recordIndex").value = recordIndex;
                    var accountNumberEle = document.getElementById("bankRecordEdit--accountNumber");
                    accountNumberEle.value = accountNumber;
                    var bankingYearEle = document.getElementById("bankRecordEdit--bankingYear");
                    bankingYearEle.value = bankingYear.toString();
                    bankingYearEle.setAttribute("max", currentYear.toString());
                    var bankingMonthEle = document.getElementById("bankRecordEdit--bankingMonth");
                    bankingMonthEle.value = bankingMonth.toString();
                    var bankRecordTypeEle = document.getElementById("bankRecordEdit--bankRecordType");
                    for (var index = 0; index < exports.config_bankRecordTypes.length; index += 1) {
                        bankRecordTypeEle.insertAdjacentHTML("beforeend", "<option value=\"" + exports.config_bankRecordTypes[index].bankRecordType + "\">" +
                            exports.config_bankRecordTypes[index].bankRecordTypeName +
                            "</option>");
                    }
                    if (bankRecordType === "") {
                        bankRecordTypeEle.insertAdjacentHTML("afterbegin", "<option value=\"\">(Select One)</option>");
                    }
                    bankRecordTypeEle.value = bankRecordType;
                    var recordDateStringEle = document.getElementById("bankRecordEdit--recordDateString");
                    recordDateStringEle.value = recordDateString;
                    recordDateStringEle.setAttribute("max", currentDateString);
                    if (recordIsNA) {
                        document.getElementById("bankRecordEdit--recordIsNA").setAttribute("checked", "checked");
                    }
                    document.getElementById("bankRecordEdit--recordNote").value = recordNote;
                    if (lockKeyFields) {
                        if (!accountNumberIsBlank) {
                            accountNumberEle.setAttribute("readonly", "readonly");
                            accountNumberEle.classList.add("is-readonly");
                        }
                        bankingYearEle.setAttribute("readonly", "readonly");
                        bankingYearEle.classList.add("is-readonly");
                        bankingMonthEle.setAttribute("readonly", "readonly");
                        bankingMonthEle.classList.add("is-readonly");
                        bankRecordTypeEle.setAttribute("readonly", "readonly");
                        bankRecordTypeEle.classList.add("is-readonly");
                    }
                    if (isUpdate) {
                        var deleteButtonEle = document.getElementById("bankRecordEdit--deleteRecordButton");
                        deleteButtonEle.setAttribute("data-record-index", recordIndex);
                        deleteButtonEle.addEventListener("click", deleteBankRecordFn);
                    }
                    else {
                        document.getElementById("bankRecordEdit--moreOptionsDropdown").remove();
                    }
                },
                onshown: function (modalEle, closeModalFn) {
                    bankRecordEditCloseModalFn = closeModalFn;
                    modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitBankRecordEditFn);
                }
            });
        };
        var buttonEles = bankRecordsTableEle.getElementsByTagName("button");
        for (var index = 0; index < buttonEles.length; index += 1) {
            buttonEles[index].addEventListener("click", openBankRecordEditModal);
        }
        document.getElementById("is-add-bank-record-button").addEventListener("click", openBankRecordEditModal);
    }
    llm.initializeTabs(document.getElementById("tabs--organization"), {
        onshown: function (tabContentEle) {
            if (tabContentEle.id === "organizationTabContent--bankRecords" && !bankRecordsFiltersLoaded) {
                bankRecordsFiltersLoaded = true;
                loadBankRecordFilters();
            }
        }
    });
}());
