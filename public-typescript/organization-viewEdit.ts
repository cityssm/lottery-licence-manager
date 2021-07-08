/* eslint-disable unicorn/filename-case, unicorn/prefer-module */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";

import type * as recordTypes from "../types/recordTypes";
import type * as configTypes from "../types/configTypes";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


(() => {

  const mainElement = document.querySelector("main");

  const urlPrefix = mainElement.dataset.urlPrefix;
  const canCreate = mainElement.dataset.canUpdate === "true";

  /*
   * Remarks
   */

  const remarksContainerElement = document.querySelector("#container--remarks") as HTMLElement;

  // Update remarks

  if (canCreate) {

    const organizationID = Number.parseInt(remarksContainerElement.dataset.organizationId, 10);

    const editRemarkFunction = (buttonEvent: Event) => {

      const remarkIndex =
        Number.parseInt((buttonEvent.currentTarget as HTMLButtonElement).dataset.remarkIndex, 10);

      llm.organizationRemarks.openEditRemarkModal(organizationID, remarkIndex, refreshRemarksFunction);
    };

    const deleteRemarkFunction = (buttonEvent: Event) => {

      const remarkIndex =
        Number.parseInt((buttonEvent.currentTarget as HTMLButtonElement).dataset.remarkIndex, 10);

      llm.organizationRemarks.deleteRemark(organizationID, remarkIndex, true, refreshRemarksFunction);
    };

    const refreshRemarksFunction = () => {

      llm.organizationRemarks.getRemarksByOrganizationID(organizationID, (remarkList) => {

        cityssm.clearElement(remarksContainerElement);

        if (remarkList.length === 0) {

          remarksContainerElement.innerHTML = "<div class=\"panel-block\">" +
            "<div class=\"message is-info\">" +
            "<p class=\"message-body\">There are no remarks associated with this organization.</p>" +
            "</div>" +
            "</div>";

        } else {

          for (const remark of remarkList) {

            remarksContainerElement.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
              "<div class=\"columns is-mobile\">" +
              "<div class=\"column is-narrow\">" +
              (remark.isImportant
                ? "<i class=\"fas fa-fw fa-star\" aria-hidden=\"true\"></i>"
                : "<i class=\"far fa-fw fa-comment\" aria-hidden=\"true\"></i>") +
              "</div>" +
              "<div class=\"column\">" +
              "<p class=\"has-newline-chars\">" + cityssm.escapeHTML(remark.remark) + "</p>" +
              "<p class=\"is-size-7\">" +
              (remark.recordCreate_timeMillis === remark.recordUpdate_timeMillis
                ? ""
                : "<i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i> ") +
              remark.recordUpdate_userName + " - " + remark.remarkDateString + " " + remark.remarkTimeString +
              "</p>" +
              "</div>" +
              (remark.canUpdate
                ? "<div class=\"column is-narrow\">" +
                "<div class=\"buttons is-right has-addons\">" +
                ("<button class=\"button is-small is-edit-remark-button\"" +
                  " data-remark-index=\"" + remark.remarkIndex.toString() + "\"" +
                  " data-tooltip=\"Edit Remark\" type=\"button\">" +
                  "<span class=\"icon is-small\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                  "<span>Edit</span>" +
                  "</button>") +
                ("<button class=\"button is-small has-text-danger is-delete-remark-button\"" +
                  " data-remark-index=\"" + remark.remarkIndex.toString() + "\"" +
                  " data-tooltip=\"Delete Remark\" type=\"button\">" +
                  "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
                  "<span class=\"sr-only\">Delete</span>" +
                  "</button>") +
                "</div>" +
                "</div>"
                : "") +
              "</div>" +
              "</div>");
          }

          const editButtonElements = remarksContainerElement.querySelectorAll(".is-edit-remark-button");

          for (const editButtonElement of editButtonElements) {
            editButtonElement.addEventListener("click", editRemarkFunction);
          }

          const deleteButtonElements = remarksContainerElement.querySelectorAll(".is-delete-remark-button");

          for (const deleteButtonElement of deleteButtonElements) {
            deleteButtonElement.addEventListener("click", deleteRemarkFunction);
          }
        }
      });
    };

    document.querySelector(".is-add-remark-button").addEventListener("click", (clickEvent) => {

      clickEvent.preventDefault();
      llm.organizationRemarks.openAddRemarkModal(organizationID, refreshRemarksFunction);
    });

    const editButtonElements = remarksContainerElement.querySelectorAll(".is-edit-remark-button");

    for (const editButtonElement of editButtonElements) {
      editButtonElement.addEventListener("click", editRemarkFunction);
    }

    const deleteButtonElements = remarksContainerElement.querySelectorAll(".is-delete-remark-button");

    for (const deleteButtonElement of deleteButtonElements) {
      deleteButtonElement.addEventListener("click", deleteRemarkFunction);
    }
  }

  // Filter remarks

  const remarkSearchStringElement = document.querySelector("#remark--searchStr") as HTMLInputElement;

  if (remarkSearchStringElement) {

    remarkSearchStringElement.value = "";

    const remarkDisplayCountElement = document.querySelector("#remark--displayCount");

    const remarkBlockElements =
      remarksContainerElement.querySelectorAll(".is-remark-block") as NodeListOf<HTMLElement>;

    remarkSearchStringElement.addEventListener("keyup", () => {

      const searchStringSplit = remarkSearchStringElement.value
        .trim()
        .toLowerCase()
        .split(" ");

      let displayCount = remarkBlockElements.length;

      for (const remarkBlockElement of remarkBlockElements) {

        const remark = (remarkBlockElement.querySelector(".is-remark") as HTMLElement).textContent
          .trim()
          .toLowerCase();

        let showRemark = true;

        for (const searchStringPiece of searchStringSplit) {

          if (!remark.includes(searchStringPiece)) {

            showRemark = false;
            displayCount -= 1;

            break;
          }
        }

        if (showRemark) {
          remarkBlockElement.classList.remove("is-hidden");
        } else {
          remarkBlockElement.classList.add("is-hidden");
        }

      }

      remarkDisplayCountElement.textContent = displayCount.toString();
    });
  }


  /*
   * Bank Records
   */

  let bankRecordsFiltersLoaded = false;

  const bankRecordsCache = new Map<number, recordTypes.OrganizationBankRecord>();

  const bankRecordsBankingYearFilterElement =
    document.querySelector("#bankRecordFilter--bankingYear") as HTMLSelectElement;

  const bankRecordsAccountNumberFilterElement =
    document.querySelector("#bankRecordFilter--accountNumber") as HTMLSelectElement;

  const bankRecordsTableElement = document.querySelector("#table--bankRecords") as HTMLTableElement;

  const organizationID = bankRecordsTableElement.dataset.organizationId;

  const clearBankRecordsTableFunction = () => {

    bankRecordsCache.clear();

    bankRecordsTableElement.classList.remove("has-status-loaded");
    bankRecordsTableElement.classList.add("has-status-loading");

    const infoElements = bankRecordsTableElement.querySelectorAll(".is-bank-record-info");

    for (const infoElement of infoElements) {

      infoElement.innerHTML = "<i class=\"fas fa-minus has-text-grey-lighter\" aria-hidden=\"true\"></i>" +
        "<br />" +
        "<strong class=\"is-size-7 has-text-grey-light\">No Record Recorded</strong>";

      const tdElement = infoElement.closest("td");

      tdElement.dataset.recordIndex = "";
      tdElement.classList.remove("has-background-info-light");
      tdElement.classList.remove("has-background-success-light");
      tdElement.classList.remove("has-background-warning-light");
    }
  };

  const getBankRecordsFunction = () => {

    clearBankRecordsTableFunction();

    const processRecordsFunction = (bankRecords: recordTypes.OrganizationBankRecord[]) => {

      for (const bankRecord of bankRecords) {

        bankRecordsCache.set(bankRecord.recordIndex, bankRecord);

        const tdElement: HTMLTableCellElement = bankRecordsTableElement
          .querySelector("[data-banking-month='" + bankRecord.bankingMonth.toString() + "']")
          .querySelector("[data-bank-record-type='" + bankRecord.bankRecordType + "']");

        if (!tdElement) {
          continue;
        }

        tdElement.dataset.recordIndex = bankRecord.recordIndex.toString();

        const infoElement = tdElement.querySelector(".is-bank-record-info");

        if (bankRecord.recordIsNA) {

          tdElement.classList.add("has-background-info-light");

          infoElement.innerHTML =
            "<i class=\"fas fa-times\" aria-hidden=\"true\"></i>" +
            "<br />" +
            "<span class=\"has-text-weight-bold is-size-7\">Not Applicable</span>";

        } else if (!bankRecord.recordDate) {

          tdElement.classList.add("has-background-warning-light");

          infoElement.innerHTML =
            "<i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i>" +
            "<br />" +
            "<span class=\"has-text-weight-bold is-size-7\">Not Recorded</span>";

        } else {

          tdElement.classList.add("has-background-success-light");

          infoElement.innerHTML =
            "<i class=\"fas fa-check\" aria-hidden=\"true\"></i>" +
            "<br />" +
            "<span class=\"has-text-weight-bold is-size-7\">Recorded " + bankRecord.recordDateString + "</span>";

        }

        if (bankRecord.recordNote !== "") {
          infoElement.insertAdjacentHTML("beforeend", "<div class=\"is-size-7 has-text-left\">" +
            "<span class=\"icon\"><i class=\"fas fa-sticky-note\" aria-hidden=\"true\"></i></span> " +
            cityssm.escapeHTML(bankRecord.recordNote) +
            "</div>");
        }
      }

      bankRecordsTableElement.classList.remove("has-status-loading");
      bankRecordsTableElement.classList.add("has-status-loaded");

    };

    if (bankRecordsAccountNumberFilterElement.value === "") {

      processRecordsFunction([]);

    } else {

      cityssm.postJSON(urlPrefix + "/organizations/doGetBankRecords", {
        organizationID,
        bankingYear: bankRecordsBankingYearFilterElement.value,
        accountNumber: bankRecordsAccountNumberFilterElement.value
      }, processRecordsFunction);
    }
  };

  const loadBankRecordFiltersFunction = () => {

    cityssm.postJSON(urlPrefix + "/organizations/doGetBankRecordStats", {
      organizationID
    },
      (bankRecordStats: Array<{
        accountNumber: string;
        bankingYearMin: number;
        bankingYearMax: number;
      }>) => {

        const currentYear = new Date().getFullYear();

        let bankingYearMin = currentYear - 1;

        // Account Number Select

        if (bankRecordStats.length === 0) {

          bankRecordsAccountNumberFilterElement.innerHTML = "<option value=\"\">(No Accounts Recorded)</option>";

        } else {

          bankRecordsAccountNumberFilterElement.innerHTML = "";

          for (const bankRecordsStat of bankRecordStats) {

            bankingYearMin = Math.min(bankRecordsStat.bankingYearMin, bankingYearMin);

            const accountNumber = cityssm.escapeHTML(bankRecordsStat.accountNumber);

            bankRecordsAccountNumberFilterElement.insertAdjacentHTML(
              "beforeend",
              "<option value=\"" + accountNumber + "\">" +
              accountNumber +
              " (From " + bankRecordsStat.bankingYearMin.toString() + " to " + bankRecordsStat.bankingYearMax.toString() + ")" +
              "</option>"
            );
          }
        }

        // Banking Year Select

        bankRecordsBankingYearFilterElement.innerHTML = "";

        for (let year = currentYear; year >= bankingYearMin; year -= 1) {

          bankRecordsBankingYearFilterElement.insertAdjacentHTML("beforeend", "<option value=\"" + year.toString() + "\">" +
            year.toString() +
            "</option>");
        }

        getBankRecordsFunction();

      });
  };

  const setExportURLFunction = () => {

    (document.querySelector("#bankRecords--export") as HTMLAnchorElement).href = urlPrefix + "/reports/bankRecordsFlat-byOrganizationAndBankingYear" +
      "?organizationID=" + organizationID +
      "&bankingYear=" + bankRecordsBankingYearFilterElement.value;
  };

  setExportURLFunction();

  bankRecordsAccountNumberFilterElement.addEventListener("change", getBankRecordsFunction);

  bankRecordsBankingYearFilterElement.addEventListener("change", getBankRecordsFunction);
  bankRecordsBankingYearFilterElement.addEventListener("change", setExportURLFunction);

  if (canCreate) {

    const openBankRecordEditModalFunction = (buttonEvent: Event) => {

      const isNavBlockedByPage = cityssm.isNavBlockerEnabled();

      let bankRecordEditCloseModalFunction: () => void;
      let isUpdate = false;
      let lockKeyFields = false;
      let accountNumberIsBlank = true;

      const submitBankRecordEditFunction = (formEvent: Event) => {

        formEvent.preventDefault();

        cityssm.postJSON(urlPrefix + "/organizations/" + (isUpdate ? "doEditBankRecord" : "doAddBankRecord"),
          formEvent.currentTarget,
          (resultJSON: { success: boolean; message?: string }) => {

            if (resultJSON.success) {

              bankRecordEditCloseModalFunction();

              if (isUpdate || (lockKeyFields && !accountNumberIsBlank)) {

                getBankRecordsFunction();

              } else {

                bankRecordsFiltersLoaded = false;
                loadBankRecordFiltersFunction();
              }

            } else {
              cityssm.alertModal("Record Not Saved", resultJSON.message, "OK", "danger");
            }
          }
        );
      };

      const deleteBankRecordFunction = (deleteButtonEvent: Event) => {

        deleteButtonEvent.preventDefault();

        const recordIndex = (deleteButtonEvent.currentTarget as HTMLButtonElement).dataset.recordIndex;

        const deleteFunction = () => {

          cityssm.postJSON(urlPrefix + "/organizations/doDeleteBankRecord", {
            organizationID,
            recordIndex
          }, () => {

            bankRecordEditCloseModalFunction();
            getBankRecordsFunction();
          });

        };

        cityssm.confirmModal(
          "Delete Bank Record?",
          "Are you sure you want to delete this bank record?",
          "Yes, Delete",
          "warning",
          deleteFunction
        );

      };

      // Get the button
      const buttonElement = buttonEvent.currentTarget as HTMLButtonElement;

      // Set defaults
      let recordIndex = "";

      const accountNumber = bankRecordsAccountNumberFilterElement.value;
      accountNumberIsBlank = (accountNumber === "");

      let bankRecordType = "";
      let recordIsNA = false;
      let recordNote = "";

      const dateObject = new Date();

      const currentYear = dateObject.getFullYear();
      const currentDateString = cityssm.dateToString(dateObject);

      let recordDateString = currentDateString;

      dateObject.setMonth(dateObject.getMonth() - 1);

      let bankingYear = dateObject.getFullYear();
      let bankingMonth = dateObject.getMonth() + 1;

      // If it's one of the add buttons in the table, retrieve data
      if (buttonElement.id !== "is-add-bank-record-button") {

        lockKeyFields = true;

        const tdElement = buttonElement.closest("td");

        recordIndex = tdElement.getAttribute("data-record-index");

        bankingYear = Number.parseInt(bankRecordsBankingYearFilterElement.value, 10);

        // If no record exists, use default data
        if (recordIndex === "") {

          bankingMonth = Number.parseInt(tdElement.closest("tr").dataset.bankingMonth, 10);

          bankRecordType = tdElement.dataset.bankRecordType;

        } else {

          const recordObject = bankRecordsCache.get(Number.parseInt(recordIndex, 10));

          isUpdate = true;
          bankingMonth = recordObject.bankingMonth;
          bankRecordType = recordObject.bankRecordType;
          recordIsNA = recordObject.recordIsNA;
          recordDateString = recordObject.recordDateString;
          recordNote = recordObject.recordNote;
        }
      }

      cityssm.openHtmlModal("organization-bankRecordEdit", {

        onshow() {

          cityssm.enableNavBlocker();

          (document.querySelector("#bankRecordEdit--organizationID") as HTMLInputElement).value = organizationID;
          (document.querySelector("#bankRecordEdit--recordIndex") as HTMLInputElement).value = recordIndex;

          const accountNumberElement = document.querySelector("#bankRecordEdit--accountNumber") as HTMLInputElement;
          accountNumberElement.value = accountNumber;

          const bankingYearElement = document.querySelector("#bankRecordEdit--bankingYear") as HTMLInputElement;
          bankingYearElement.value = bankingYear.toString();
          bankingYearElement.setAttribute("max", currentYear.toString());

          const bankingMonthElement = document.querySelector("#bankRecordEdit--bankingMonth") as HTMLInputElement;
          bankingMonthElement.value = bankingMonth.toString();

          const bankRecordTypeElement = document.querySelector("#bankRecordEdit--bankRecordType") as HTMLSelectElement;

          for (const config_bankRecordType of (exports.config_bankRecordTypes as configTypes.ConfigBankRecordType[])) {

            bankRecordTypeElement.insertAdjacentHTML(
              "beforeend",
              "<option value=\"" + config_bankRecordType.bankRecordType + "\">" +
              config_bankRecordType.bankRecordTypeName +
              "</option>"
            );

          }

          if (bankRecordType === "") {

            bankRecordTypeElement.insertAdjacentHTML(
              "afterbegin",
              "<option value=\"\">(Select One)</option>"
            );
          }

          bankRecordTypeElement.value = bankRecordType;

          const recordDateStringElement = document.querySelector("#bankRecordEdit--recordDateString") as HTMLInputElement;

          recordDateStringElement.value = recordDateString;
          recordDateStringElement.setAttribute("max", currentDateString);

          if (recordIsNA) {
            document.querySelector("#bankRecordEdit--recordIsNA").setAttribute("checked", "checked");
          }

          (document.querySelector("#bankRecordEdit--recordNote") as HTMLTextAreaElement).value = recordNote;

          if (lockKeyFields) {

            if (!accountNumberIsBlank) {

              accountNumberElement.setAttribute("readonly", "readonly");
              accountNumberElement.classList.add("is-readonly");
            }

            bankingYearElement.setAttribute("readonly", "readonly");
            bankingYearElement.classList.add("is-readonly");

            bankingMonthElement.setAttribute("readonly", "readonly");
            bankingMonthElement.classList.add("is-readonly");

            bankRecordTypeElement.setAttribute("readonly", "readonly");
            bankRecordTypeElement.classList.add("is-readonly");

          }

          if (isUpdate) {

            const deleteButtonElement = document.querySelector("#bankRecordEdit--deleteRecordButton") as HTMLButtonElement;
            deleteButtonElement.dataset.recordIndex = recordIndex;
            deleteButtonElement.addEventListener("click", deleteBankRecordFunction);

          } else {
            document.querySelector("#bankRecordEdit--moreOptionsDropdown").remove();
          }
        },
        onshown(modalElement, closeModalFunction) {

          bankRecordEditCloseModalFunction = closeModalFunction;
          modalElement.querySelector("form").addEventListener("submit", submitBankRecordEditFunction);
        },
        onremoved() {
          if (!isNavBlockedByPage) {
            cityssm.disableNavBlocker();
          }
        }
      });
    };

    /*
     * Main "Add" Button
     */

    const addRecordButtonElement = document.querySelector("#is-add-bank-record-button");

    if (addRecordButtonElement) {
      addRecordButtonElement.addEventListener("click", openBankRecordEditModalFunction);
    }

    /*
     * Single Record Edit
     */

    const buttonElements = bankRecordsTableElement.querySelectorAll(".is-bank-record-button");

    for (const buttonElement of buttonElements) {
      buttonElement.addEventListener("click", openBankRecordEditModalFunction);
    }

    /*
     * Multiple Record Edit
     */

    const openBankRecordMonthEditModalFunction = (buttonEvent: Event) => {

      // Ensure an account number is available

      const accountNumber = bankRecordsAccountNumberFilterElement.value;

      if (accountNumber === "") {
        cityssm.alertModal("No Account Number Set",
          "Please add at least one bank record with the account number you are looking to record.",
          "OK",
          "warning");

        return;
      }

      // Sync functions

      let recordDateRowIndex = -1;

      const syncFunction_enableDateField = (rowIndexString: string) => {
        const recordDateElement = document.querySelector("#bankRecordMonthEdit--recordDateString-" + rowIndexString) as HTMLInputElement;
        recordDateElement.classList.remove("is-readonly");
        recordDateElement.readOnly = false;
      };

      const syncFunction_disableDateField = (rowIndexString: string) => {
        const recordDateElement = document.querySelector("#bankRecordMonthEdit--recordDateString-" + rowIndexString) as HTMLInputElement;
        recordDateElement.classList.add("is-readonly");
        recordDateElement.readOnly = true;
        recordDateElement.value = (document.querySelector("#bankRecordMonthEdit--recordDateString-0") as HTMLInputElement).value;
      };

      const syncFunction_toggleDateField = (changeEvent: Event) => {

        const syncRecordDateCheckboxElement = changeEvent.currentTarget as HTMLInputElement;

        const rowIndexString = syncRecordDateCheckboxElement.value;

        if (syncRecordDateCheckboxElement.checked) {
          syncFunction_disableDateField(rowIndexString);
        } else {
          syncFunction_enableDateField(rowIndexString);
        }
      };

      const syncFunction_copyToSyncedDates = () => {

        const recordDateString = (document.querySelector("#bankRecordMonthEdit--recordDateString-0") as HTMLInputElement).value;

        for (let index = 1; index <= recordDateRowIndex; index += 1) {

          if ((document.querySelector("#bankRecordMonthEdit--syncRecordDate-" + index.toString()) as HTMLInputElement).checked) {
            (document.querySelector("#bankRecordMonthEdit--recordDateString-" + index.toString()) as HTMLInputElement).value = recordDateString;
          }
        }
      };

      const dateFunction_setToToday = (clickEvent: Event) => {

        const rowIndexString = (clickEvent.currentTarget as HTMLButtonElement).value;

        if (rowIndexString === "0" ||
          !(document.querySelector("#bankRecordMonthEdit--syncRecordDate-" + rowIndexString) as HTMLInputElement).checked) {

          (document.querySelector("#bankRecordMonthEdit--recordDateString-" + rowIndexString) as HTMLInputElement).value = cityssm.dateToString(new Date());

          if (rowIndexString === "0") {
            syncFunction_copyToSyncedDates();
          }
        } else {
          cityssm.alertModal("Date Not Changed",
            "This date is synced with the date on the first band record type.",
            "OK",
            "warning");
        }
      };

      // Submit function

      let closeBankRecordMonthEditModalFunction: () => void;

      const submitFunction = (formEvent: Event) => {
        formEvent.preventDefault();

        cityssm.postJSON(urlPrefix + "/organizations/doUpdateBankRecordsByMonth",
          formEvent.currentTarget,
          (responseJSON: {
            success: boolean;
            message?: string;
          }) => {

            if (responseJSON.success) {
              closeBankRecordMonthEditModalFunction();
              getBankRecordsFunction();
            }
          });
      };

      // Track if navigation is already blocked

      const isNavBlockedByPage = cityssm.isNavBlockerEnabled();

      // Get date details

      const bankingYear = Number.parseInt(bankRecordsBankingYearFilterElement.value, 10);

      const trElement = (buttonEvent.currentTarget as HTMLButtonElement).closest("tr");

      const bankingMonth = Number.parseInt(trElement.getAttribute("data-banking-month"), 10);

      // Get data for the month

      const tdElements = trElement.querySelectorAll("td");

      const bankRecordTypeToRecord = new Map<string, recordTypes.OrganizationBankRecord>();

      for (const tdElement of tdElements) {

        const recordIndexString = tdElement.dataset.recordIndex;

        if (recordIndexString !== "") {
          const bankRecord = bankRecordsCache.get(Number.parseInt(recordIndexString, 10));
          bankRecordTypeToRecord.set(bankRecord.bankRecordType, bankRecord);
        }
      }

      cityssm.openHtmlModal("organization-bankRecordMonthEdit", {
        onshow() {

          cityssm.enableNavBlocker();

          // Set organization and month data

          (document.querySelector("#bankRecordMonthEdit--organizationID") as HTMLInputElement).value = organizationID;

          (document.querySelector("#bankRecordMonthEdit--accountNumber") as HTMLInputElement).value = accountNumber;
          (document.querySelector("#bankRecordMonthEdit--bankingYear") as HTMLInputElement).value = bankingYear.toString();
          (document.querySelector("#bankRecordMonthEdit--bankingMonth") as HTMLInputElement).value = bankingMonth.toString();

          (document.querySelector("#bankRecordMonthEdit--accountNumber-span") as HTMLSpanElement).textContent = accountNumber;
          (document.querySelector("#bankRecordMonthEdit--bankingYear-span") as HTMLSpanElement).textContent = bankingYear.toString();
          (document.querySelector("#bankRecordMonthEdit--bankingMonth-span") as HTMLSpanElement).textContent = bankingMonth.toString();

          // Create record type fields

          const recordTypeContainerElement = document.querySelector("#container--bankRecordMonthEdit-recordTypes");

          for (const config_bankRecordType of (exports.config_bankRecordTypes as configTypes.ConfigBankRecordType[])) {

            recordDateRowIndex += 1;

            const rowIndexString = recordDateRowIndex.toString();

            recordTypeContainerElement.insertAdjacentHTML(
              "beforeend",
              "<hr />");

            recordTypeContainerElement.insertAdjacentHTML("beforeend",
              "<input id=\"bankRecordMonthEdit--recordIndex-" + rowIndexString + "\" name=\"recordIndex-" + rowIndexString + "\" type=\"hidden\" value=\"\" />");

            recordTypeContainerElement.insertAdjacentHTML("beforeend",
              "<input name=\"bankRecordType-" + rowIndexString + "\" type=\"hidden\" value=\"" + cityssm.escapeHTML(config_bankRecordType.bankRecordType) + "\" />");

            recordTypeContainerElement.insertAdjacentHTML(
              "beforeend",
              "<div class=\"columns is-mobile\">" +
              ("<div class=\"column\">" +
                "<strong>" + cityssm.escapeHTML(config_bankRecordType.bankRecordTypeName) + "</strong>" +
                "</div>") +
              ("<div class=\"column is-narrow has-text-right\">" +
                (recordDateRowIndex === 0
                  ? ""
                  : "<div class=\"facheck facheck-inline facheck-fas-checked is-info\">" +
                  "<input id=\"bankRecordMonthEdit--syncRecordDate-" + rowIndexString + "\" name=\"syncRecordDate-" + rowIndexString + "\" type=\"checkbox\" value=\"" + rowIndexString + "\" checked />" +
                  "<label for=\"bankRecordMonthEdit--syncRecordDate-" + rowIndexString + "\">" +
                  "Sync Record Date" +
                  "</label>" +
                  "</div>") +
                ("<div class=\"facheck facheck-inline facheck-fas-checked is-info\">" +
                  "<input id=\"bankRecordMonthEdit--recordIsNA-" + rowIndexString + "\" name=\"recordIsNA-" + rowIndexString + "\" type=\"checkbox\" value=\"1\" />" +
                  "<label for=\"bankRecordMonthEdit--recordIsNA-" + rowIndexString + "\">" +
                  "Not Applicable" +
                  "</label>" +
                  "</div>") +
                "</div>") +
              "</div>");

            recordTypeContainerElement.insertAdjacentHTML(
              "beforeend",
              "<div class=\"columns\">" +
              ("<div class=\"column\">" +
                "<div class=\"field has-addons\">" +
                ("<div class=\"control is-expanded has-icons-left\">" +
                  "<input" +
                  " class=\"input" + (recordDateRowIndex === 0 ? "" : " is-readonly") + "\"" +
                  " id=\"bankRecordMonthEdit--recordDateString-" + rowIndexString + "\"" +
                  " name=\"recordDateString-" + rowIndexString + "\"" +
                  " type=\"date\"" +
                  " aria-label=\"Record Date\"" +
                  (recordDateRowIndex === 0 ? "" : " readonly") +
                  " />" +
                  "<span class=\"icon is-small is-left\"><i class=\"fas fa-calendar\" aria-hidden=\"true\"></i></span>" +
                  "</div>") +
                ("<div class=\"control\">" +
                  "<button class=\"button is-info\" id=\"bankRecordMonthEdit--setToToday-" + rowIndexString + "\" data-tooltip=\"Set to Today\" type=\"button\" value=\"" + rowIndexString + "\">" +
                  "<i class=\"fas fa-calendar-day\" aria-hidden=\"true\"></i>" +
                  "<span class=\"sr-only\">Set to Today</span>" +
                  "</button>" +
                  "</div>") +
                "</div>" +
                "</div>") +
              ("<div class=\"column\">" +
                "<div class=\"control has-icons-left\">" +
                "<input class=\"input\"" +
                " id=\"bankRecordMonthEdit--recordNote-" + rowIndexString + "\"" +
                " name=\"recordNote-" + rowIndexString + "\"" +
                " type=\"text\"" +
                " placeholder=\"Optional Note\"" +
                " aria-label=\"Optional Note\" />" +
                "<span class=\"icon is-small is-left\"><i class=\"fas fa-sticky-note\" aria-hidden=\"true\"></i></span>" +
                "</div>" +
                "</div>") +
              "</div>");

            // Populate fields

            const bankRecord = bankRecordTypeToRecord.get(config_bankRecordType.bankRecordType);

            if (bankRecord) {

              (document.querySelector("#bankRecordMonthEdit--recordIndex-" + rowIndexString) as HTMLInputElement).value = bankRecord.recordIndex.toString();

              if (bankRecord.recordIsNA) {
                (document.querySelector("#bankRecordMonthEdit--recordIsNA-" + rowIndexString) as HTMLInputElement).checked = true;
              }

              (document.querySelector("#bankRecordMonthEdit--recordDateString-" + rowIndexString) as HTMLInputElement).value = bankRecord.recordDateString;
              (document.querySelector("#bankRecordMonthEdit--recordNote-" + rowIndexString) as HTMLInputElement).value = bankRecord.recordNote;
            }

            // Sync setup

            if (recordDateRowIndex !== 0) {

              const syncRecordDateCheckboxElement = document.querySelector("#bankRecordMonthEdit--syncRecordDate-" + rowIndexString) as HTMLInputElement;

              syncRecordDateCheckboxElement.addEventListener("change", syncFunction_toggleDateField);

              // Disable sync

              const mainRecordDateString = (document.querySelector("#bankRecordMonthEdit--recordDateString-0") as HTMLInputElement).value;

              if ((bankRecord && bankRecord.recordDateString !== mainRecordDateString) || (!bankRecord && mainRecordDateString !== "")) {
                syncRecordDateCheckboxElement.checked = false;
                syncFunction_enableDateField(rowIndexString);
              }
            }

            // Today button

            document.querySelector("#bankRecordMonthEdit--setToToday-" + rowIndexString).addEventListener("click", dateFunction_setToToday);
          }

          (document.querySelector("#bankRecordMonthEdit--bankRecordTypeIndex") as HTMLInputElement).value = recordDateRowIndex.toString();

          if (recordDateRowIndex >= 0) {
            document.querySelector("#bankRecordMonthEdit--recordDateString-0").addEventListener("change", syncFunction_copyToSyncedDates);
          }

        },
        onshown(_modalElement, closeModalFunction) {

          document.querySelector("#form--bankRecordMonthEdit").addEventListener("submit", submitFunction);
          closeBankRecordMonthEditModalFunction = closeModalFunction;
        },
        onremoved() {
          if (!isNavBlockedByPage) {
            cityssm.disableNavBlocker();
          }
        }
      });
    };

    const monthButtonElements = bankRecordsTableElement.querySelectorAll(".is-bank-record-month-button");

    for (const buttonElement of monthButtonElements) {
      buttonElement.addEventListener("click", openBankRecordMonthEditModalFunction);
    }
  }

  /*
   * Tabs
   */

  llm.initializeTabs(document.querySelector("#tabs--organization"), {
    onshown (tabContentElement) {

      if (tabContentElement.id === "organizationTabContent--bankRecords" && !bankRecordsFiltersLoaded) {
        bankRecordsFiltersLoaded = true;
        loadBankRecordFiltersFunction();
      }
    }
  });
})();
