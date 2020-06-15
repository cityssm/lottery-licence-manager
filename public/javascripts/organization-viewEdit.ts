import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;

import type { llmGlobal } from "./types";
declare const llm: llmGlobal;

import type * as llmTypes from "../../helpers/llmTypes";


(function() {

  const canCreate = document.getElementsByTagName("main")[0].getAttribute("data-can-create") === "true";

  /*
   * Remarks
   */

  const remarksContainerEle = document.getElementById("container--remarks");

  // Update remarks

  if (canCreate) {

    const organizationID = parseInt(remarksContainerEle.getAttribute("data-organization-id"), 10);

    let refreshRemarksFn: () => void;

    const editRemarkFn = function(buttonEvent: Event) {

      const remarkIndex = parseInt((<HTMLButtonElement>buttonEvent.currentTarget).getAttribute("data-remark-index"), 10);
      llm.organizationRemarks.openEditRemarkModal(organizationID, remarkIndex, refreshRemarksFn);

    };

    const deleteRemarkFn = function(buttonEvent: Event) {

      const remarkIndex = parseInt((<HTMLButtonElement>buttonEvent.currentTarget).getAttribute("data-remark-index"), 10);
      llm.organizationRemarks.deleteRemark(organizationID, remarkIndex, true, refreshRemarksFn);

    };

    refreshRemarksFn = function() {

      llm.organizationRemarks.getRemarksByOrganizationID(organizationID, function(remarkList) {

        cityssm.clearElement(remarksContainerEle);

        if (remarkList.length === 0) {

          remarksContainerEle.innerHTML = "<div class=\"panel-block\">" +
            "<div class=\"message is-info\">" +
            "<p class=\"message-body\">There are no remarks associated with this organization.</p>" +
            "</div>" +
            "</div>";

        } else {

          for (let remarkIndex = 0; remarkIndex < remarkList.length; remarkIndex += 1) {

            const remark = remarkList[remarkIndex];

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

          const editBtnEles = remarksContainerEle.getElementsByClassName("is-edit-remark-button");

          for (let btnIndex = 0; btnIndex < editBtnEles.length; btnIndex += 1) {

            editBtnEles[btnIndex].addEventListener("click", editRemarkFn);

          }

          const deleteBtnEles = remarksContainerEle.getElementsByClassName("is-delete-remark-button");

          for (let btnIndex = 0; btnIndex < deleteBtnEles.length; btnIndex += 1) {

            deleteBtnEles[btnIndex].addEventListener("click", deleteRemarkFn);

          }

        }

      });

    };

    document.getElementsByClassName("is-add-remark-button")[0].addEventListener("click", function(clickEvent) {

      clickEvent.preventDefault();
      llm.organizationRemarks.openAddRemarkModal(organizationID, refreshRemarksFn);

    });

    const editBtnEles = remarksContainerEle.getElementsByClassName("is-edit-remark-button");

    for (let btnIndex = 0; btnIndex < editBtnEles.length; btnIndex += 1) {

      editBtnEles[btnIndex].addEventListener("click", editRemarkFn);

    }

    const deleteBtnEles = remarksContainerEle.getElementsByClassName("is-delete-remark-button");

    for (let btnIndex = 0; btnIndex < deleteBtnEles.length; btnIndex += 1) {

      deleteBtnEles[btnIndex].addEventListener("click", deleteRemarkFn);

    }

  }

  // Filter remarks

  const remarkSearchStrEle = <HTMLInputElement>document.getElementById("remark--searchStr");

  if (remarkSearchStrEle) {

    remarkSearchStrEle.value = "";

    const remarkDisplayCountEle = document.getElementById("remark--displayCount");
    const remarkBlockEles = remarksContainerEle.getElementsByClassName("is-remark-block");

    remarkSearchStrEle.addEventListener("keyup", function() {

      const searchStrSplit = remarkSearchStrEle.value
        .trim()
        .toLowerCase()
        .split(" ");

      let displayCount = remarkBlockEles.length;

      for (let remarkBlockIndex = 0; remarkBlockIndex < remarkBlockEles.length; remarkBlockIndex += 1) {

        const remark = (<HTMLElement>remarkBlockEles[remarkBlockIndex].getElementsByClassName("is-remark")[0]).innerText
          .trim()
          .toLowerCase();

        let showRemark = true;

        for (let searchStrIndex = 0; searchStrIndex < searchStrSplit.length; searchStrIndex += 1) {

          if (remark.indexOf(searchStrSplit[searchStrIndex]) === -1) {

            showRemark = false;
            displayCount -= 1;

            break;

          }

        }

        if (showRemark) {

          remarkBlockEles[remarkBlockIndex].classList.remove("is-hidden");

        } else {

          remarkBlockEles[remarkBlockIndex].classList.add("is-hidden");

        }

      }

      remarkDisplayCountEle.innerText = displayCount.toString();

    });

  }


  /*
   * Bank Records
   */

  let bankRecordsFiltersLoaded = false;

  let bankRecordsCache = {};

  const bankRecordsBankingYearFilterEle = <HTMLSelectElement>document.getElementById("bankRecordFilter--bankingYear");
  const bankRecordsAccountNumberFilterEle = <HTMLSelectElement>document.getElementById("bankRecordFilter--accountNumber");

  const bankRecordsTableEle = <HTMLTableElement>document.getElementById("table--bankRecords");

  const organizationID = bankRecordsTableEle.getAttribute("data-organization-id");

  function clearBankRecordsTable() {

    bankRecordsCache = {};

    bankRecordsTableEle.classList.remove("has-status-loaded");
    bankRecordsTableEle.classList.add("has-status-loading");

    const buttonEles = bankRecordsTableEle.getElementsByClassName("is-bank-record-button");

    for (let index = 0; index < buttonEles.length; index += 1) {

      const buttonEle = buttonEles[index];

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

    const processRecordsFn = function(bankRecords: llmTypes.OrganizationBankRecord[]) {

      for (let recordIndex = 0; recordIndex < bankRecords.length; recordIndex += 1) {

        const bankRecord = bankRecords[recordIndex];

        bankRecordsCache[bankRecord.recordIndex] = bankRecord;

        const buttonEle = bankRecordsTableEle
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

        } else {

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

    } else {

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
    }, function(bankRecordStats) {

      const currentYear = new Date().getFullYear();

      let bankingYearMin = currentYear - 1;

      // Account Number Select

      if (bankRecordStats.length === 0) {

        bankRecordsAccountNumberFilterEle.innerHTML = "<option value=\"\">(No Accounts Recorded)</option>";

      } else {

        bankRecordsAccountNumberFilterEle.innerHTML = "";

        for (let index = 0; index < bankRecordStats.length; index += 1) {

          const bankRecordsStat = bankRecordStats[index];

          bankingYearMin = Math.min(bankRecordsStat.bankingYearMin, bankingYearMin);

          const accountNumber = cityssm.escapeHTML(bankRecordsStat.accountNumber);

          bankRecordsAccountNumberFilterEle.insertAdjacentHTML(
            "beforeend",
            "<option value=\"" + accountNumber + "\">" +
            accountNumber + " (From " + bankRecordsStat.bankingYearMin + " to " + bankRecordsStat.bankingYearMax + ")" +
            "</option>"
          );

        }

      }

      // Banking Year Select

      bankRecordsBankingYearFilterEle.innerHTML = "";

      for (let year = currentYear; year >= bankingYearMin; year -= 1) {

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

    const openBankRecordEditModal = function(buttonEvent: Event) {

      let bankRecordEditCloseModalFn: () => void;
      let isUpdate = false;
      let lockKeyFields = false;
      let accountNumberIsBlank = true;

      const submitBankRecordEditFn = function(formEvent: Event) {

        formEvent.preventDefault();

        cityssm.postJSON(
          "/organizations/" + (isUpdate ? "doEditBankRecord" : "doAddBankRecord"),
          formEvent.currentTarget,
          function(resultJSON) {

            if (resultJSON.success) {

              bankRecordEditCloseModalFn();

              if (isUpdate || (lockKeyFields && !accountNumberIsBlank)) {

                getBankRecords();

              } else {

                bankRecordsFiltersLoaded = false;
                loadBankRecordFilters();

              }

            } else {

              cityssm.alertModal("Record Not Saved", resultJSON.message, "OK", "danger");

            }

          }
        );

      };

      const deleteBankRecordFn = function(deleteButtonEvent: Event) {

        deleteButtonEvent.preventDefault();

        const recordIndex = (<HTMLButtonElement>deleteButtonEvent.currentTarget).getAttribute("data-record-index");

        const deleteFn = function() {

          cityssm.postJSON("/organizations/doDeleteBankRecord", {
            organizationID: organizationID,
            recordIndex: recordIndex
          }, function() {

            bankRecordEditCloseModalFn();
            getBankRecords();

          });

        };

        cityssm.confirmModal(
          "Delete Bank Record?",
          "Are you sure you want to delete this bank record?",
          "Yes, Delete",
          "warning",
          deleteFn
        );

      };

      // Get the button
      const buttonEle = <HTMLButtonElement>buttonEvent.currentTarget;

      // Set defaults
      let recordIndex = "";

      const accountNumber = bankRecordsAccountNumberFilterEle.value;
      accountNumberIsBlank = (accountNumber === "");

      let bankRecordType = "";
      let recordIsNA = false;
      let recordNote = "";

      const dateObj = new Date();

      const currentYear = dateObj.getFullYear();
      const currentDateString = cityssm.dateToString(dateObj);

      let recordDateString = currentDateString;

      dateObj.setMonth(dateObj.getMonth() - 1);

      let bankingYear = dateObj.getFullYear();
      let bankingMonth = dateObj.getMonth() + 1;

      // If it's one of the add buttons in the table, retrieve data
      if (buttonEle.id !== "is-add-bank-record-button") {

        lockKeyFields = true;

        recordIndex = buttonEle.getAttribute("data-record-index");

        bankingYear = parseInt(bankRecordsBankingYearFilterEle.value, 10);

        // If no record exists, use default data
        if (recordIndex === "") {

          bankingMonth = parseInt(buttonEle.closest("tr").getAttribute("data-banking-month"), 10);

          bankRecordType = buttonEle.getAttribute("data-bank-record-type");

        } else {

          const recordObj = bankRecordsCache[parseInt(recordIndex, 10)];

          isUpdate = true;
          bankingMonth = recordObj.bankingMonth;
          bankRecordType = recordObj.bankRecordType;
          recordIsNA = recordObj.recordIsNA;
          recordDateString = recordObj.recordDateString;
          recordNote = recordObj.recordNote;

        }

      }

      cityssm.openHtmlModal("organization-bankRecordEdit", {

        onshow: function() {

          (<HTMLInputElement>document.getElementById("bankRecordEdit--organizationID")).value = organizationID;
          (<HTMLInputElement>document.getElementById("bankRecordEdit--recordIndex")).value = recordIndex;

          const accountNumberEle = <HTMLInputElement>document.getElementById("bankRecordEdit--accountNumber");
          accountNumberEle.value = accountNumber;

          const bankingYearEle = <HTMLInputElement>document.getElementById("bankRecordEdit--bankingYear");
          bankingYearEle.value = bankingYear.toString();
          bankingYearEle.setAttribute("max", currentYear.toString());

          const bankingMonthEle = <HTMLInputElement>document.getElementById("bankRecordEdit--bankingMonth");
          bankingMonthEle.value = bankingMonth.toString();

          const bankRecordTypeEle = <HTMLSelectElement>document.getElementById("bankRecordEdit--bankRecordType");

          for (let index = 0; index < exports.config_bankRecordTypes.length; index += 1) {

            bankRecordTypeEle.insertAdjacentHTML(
              "beforeend",
              "<option value=\"" + exports.config_bankRecordTypes[index].bankRecordType + "\">" +
              exports.config_bankRecordTypes[index].bankRecordTypeName +
              "</option>"
            );

          }

          if (bankRecordType === "") {

            bankRecordTypeEle.insertAdjacentHTML(
              "afterbegin",
              "<option value=\"\">(Select One)</option>"
            );

          }

          bankRecordTypeEle.value = bankRecordType;

          const recordDateStringEle = <HTMLInputElement>document.getElementById("bankRecordEdit--recordDateString");

          recordDateStringEle.value = recordDateString;
          recordDateStringEle.setAttribute("max", currentDateString);

          if (recordIsNA) {

            document.getElementById("bankRecordEdit--recordIsNA").setAttribute("checked", "checked");

          }

          (<HTMLTextAreaElement>document.getElementById("bankRecordEdit--recordNote")).value = recordNote;

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

            const deleteButtonEle = document.getElementById("bankRecordEdit--deleteRecordButton");
            deleteButtonEle.setAttribute("data-record-index", recordIndex);
            deleteButtonEle.addEventListener("click", deleteBankRecordFn);

          } else {

            document.getElementById("bankRecordEdit--moreOptionsDropdown").remove();

          }

        },
        onshown: function(modalEle, closeModalFn) {

          bankRecordEditCloseModalFn = closeModalFn;
          modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitBankRecordEditFn);

        }

      });

    };

    const buttonEles = bankRecordsTableEle.getElementsByTagName("button");

    for (let index = 0; index < buttonEles.length; index += 1) {

      buttonEles[index].addEventListener("click", openBankRecordEditModal);

    }

    document.getElementById("is-add-bank-record-button").addEventListener("click", openBankRecordEditModal);

  }

  /*
   * Tabs
   */

  llm.initializeTabs(document.getElementById("tabs--organization"), {
    onshown: function(tabContentEle) {

      if (tabContentEle.id === "organizationTabContent--bankRecords" && !bankRecordsFiltersLoaded) {

        bankRecordsFiltersLoaded = true;
        loadBankRecordFilters();

      }

    }
  });

}());