import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";

import type * as recordTypes from "../../types/recordTypes";
import type * as configTypes from "../../types/configTypes";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


(() => {

  const mainEle = document.getElementsByTagName("main")[0];

  const urlPrefix = mainEle.getAttribute("data-url-prefix");
  const canCreate = mainEle.getAttribute("data-can-create") === "true";

  /*
   * Remarks
   */

  const remarksContainerEle = document.getElementById("container--remarks");

  // Update remarks

  if (canCreate) {

    const organizationID = parseInt(remarksContainerEle.getAttribute("data-organization-id"), 10);

    const editRemarkFn = (buttonEvent: Event) => {

      const remarkIndex =
        parseInt((buttonEvent.currentTarget as HTMLButtonElement).getAttribute("data-remark-index"), 10);

      llm.organizationRemarks.openEditRemarkModal(organizationID, remarkIndex, refreshRemarksFn);
    };

    const deleteRemarkFn = (buttonEvent: Event) => {

      const remarkIndex =
        parseInt((buttonEvent.currentTarget as HTMLButtonElement).getAttribute("data-remark-index"), 10);

      llm.organizationRemarks.deleteRemark(organizationID, remarkIndex, true, refreshRemarksFn);
    };

    const refreshRemarksFn = () => {

      llm.organizationRemarks.getRemarksByOrganizationID(organizationID, (remarkList) => {

        cityssm.clearElement(remarksContainerEle);

        if (remarkList.length === 0) {

          remarksContainerEle.innerHTML = "<div class=\"panel-block\">" +
            "<div class=\"message is-info\">" +
            "<p class=\"message-body\">There are no remarks associated with this organization.</p>" +
            "</div>" +
            "</div>";

        } else {

          for (const remark of remarkList) {

            remarksContainerEle.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
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

          const editBtnEles = remarksContainerEle.getElementsByClassName("is-edit-remark-button");

          for (const editBtnEle of editBtnEles) {
            editBtnEle.addEventListener("click", editRemarkFn);
          }

          const deleteBtnEles = remarksContainerEle.getElementsByClassName("is-delete-remark-button");

          for (const deleteBtnEle of deleteBtnEles) {
            deleteBtnEle.addEventListener("click", deleteRemarkFn);
          }
        }
      });
    };

    document.getElementsByClassName("is-add-remark-button")[0].addEventListener("click", (clickEvent) => {

      clickEvent.preventDefault();
      llm.organizationRemarks.openAddRemarkModal(organizationID, refreshRemarksFn);
    });

    const editBtnEles = remarksContainerEle.getElementsByClassName("is-edit-remark-button");

    for (const editBtnEle of editBtnEles) {
      editBtnEle.addEventListener("click", editRemarkFn);
    }

    const deleteBtnEles = remarksContainerEle.getElementsByClassName("is-delete-remark-button");

    for (const deleteBtnEle of deleteBtnEles) {
      deleteBtnEle.addEventListener("click", deleteRemarkFn);
    }
  }

  // Filter remarks

  const remarkSearchStrEle = document.getElementById("remark--searchStr") as HTMLInputElement;

  if (remarkSearchStrEle) {

    remarkSearchStrEle.value = "";

    const remarkDisplayCountEle = document.getElementById("remark--displayCount");

    const remarkBlockEles =
      remarksContainerEle.getElementsByClassName("is-remark-block") as HTMLCollectionOf<HTMLElement>;

    remarkSearchStrEle.addEventListener("keyup", () => {

      const searchStrSplit = remarkSearchStrEle.value
        .trim()
        .toLowerCase()
        .split(" ");

      let displayCount = remarkBlockEles.length;

      for (const remarkBlockEle of remarkBlockEles) {

        const remark = (remarkBlockEle.getElementsByClassName("is-remark")[0] as HTMLElement).innerText
          .trim()
          .toLowerCase();

        let showRemark = true;

        for (const searchStrPiece of searchStrSplit) {

          if (!remark.includes(searchStrPiece)) {

            showRemark = false;
            displayCount -= 1;

            break;
          }
        }

        if (showRemark) {
          remarkBlockEle.classList.remove("is-hidden");
        } else {
          remarkBlockEle.classList.add("is-hidden");
        }

      }

      remarkDisplayCountEle.innerText = displayCount.toString();
    });
  }


  /*
   * Bank Records
   */

  let bankRecordsFiltersLoaded = false;

  const bankRecordsCache = new Map<number, recordTypes.OrganizationBankRecord>();

  const bankRecordsBankingYearFilterEle =
    document.getElementById("bankRecordFilter--bankingYear") as HTMLSelectElement;

  const bankRecordsAccountNumberFilterEle =
    document.getElementById("bankRecordFilter--accountNumber") as HTMLSelectElement;

  const bankRecordsTableEle = document.getElementById("table--bankRecords") as HTMLTableElement;

  const organizationID = bankRecordsTableEle.getAttribute("data-organization-id");

  const clearBankRecordsTableFn = () => {

    bankRecordsCache.clear();

    bankRecordsTableEle.classList.remove("has-status-loaded");
    bankRecordsTableEle.classList.add("has-status-loading");

    const infoEles = bankRecordsTableEle.getElementsByClassName("is-bank-record-info");

    for (const infoEle of infoEles) {

      infoEle.innerHTML = "<i class=\"fas fa-minus has-text-grey-lighter\" aria-hidden=\"true\"></i>" +
        "<br />" +
        "<strong class=\"is-size-7 has-text-grey-light\">No Record Recorded</strong>";

      const tdEle = infoEle.closest("td");

      tdEle.setAttribute("data-record-index", "");
      tdEle.classList.remove("has-background-success-light");
      tdEle.classList.remove("has-background-info-light");
    }
  };

  const getBankRecordsFn = () => {

    clearBankRecordsTableFn();

    const processRecordsFn = (bankRecords: recordTypes.OrganizationBankRecord[]) => {

      for (const bankRecord of bankRecords) {

        bankRecordsCache.set(bankRecord.recordIndex, bankRecord);

        const tdEle = bankRecordsTableEle
          .querySelector("[data-banking-month='" + bankRecord.bankingMonth.toString() + "']")
          .querySelector("[data-bank-record-type='" + bankRecord.bankRecordType + "']");

        if (!tdEle) {
          continue;
        }

        tdEle.setAttribute("data-record-index", bankRecord.recordIndex.toString());

        const infoEle = tdEle.getElementsByClassName("is-bank-record-info")[0];

        if (bankRecord.recordIsNA) {

          tdEle.classList.add("has-background-info-light");

          infoEle.innerHTML =
            "<i class=\"fas fa-times\" aria-hidden=\"true\"></i>" +
            "<br />" +
            "<span class=\"has-text-weight-bold is-size-7\">Not Applicable</span>";

        } else {

          tdEle.classList.add("has-background-success-light");

          infoEle.innerHTML =
            "<i class=\"fas fa-check\" aria-hidden=\"true\"></i>" +
            "<br />" +
            "<span class=\"has-text-weight-bold is-size-7\">Recorded " + bankRecord.recordDateString + "</span>";

        }

        if (bankRecord.recordNote !== "") {
          infoEle.insertAdjacentHTML("beforeend", "<div class=\"is-size-7 has-text-left\">" +
            "<span class=\"icon\"><i class=\"fas fa-sticky-note\" aria-hidden=\"true\"></i></span> " +
            cityssm.escapeHTML(bankRecord.recordNote) +
            "</div>");
        }
      }

      bankRecordsTableEle.classList.remove("has-status-loading");
      bankRecordsTableEle.classList.add("has-status-loaded");

    };

    if (bankRecordsAccountNumberFilterEle.value === "") {

      processRecordsFn([]);

    } else {

      cityssm.postJSON(urlPrefix + "/organizations/doGetBankRecords", {
        organizationID,
        bankingYear: bankRecordsBankingYearFilterEle.value,
        accountNumber: bankRecordsAccountNumberFilterEle.value
      }, processRecordsFn);
    }
  };

  const loadBankRecordFiltersFn = () => {

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

          bankRecordsAccountNumberFilterEle.innerHTML = "<option value=\"\">(No Accounts Recorded)</option>";

        } else {

          bankRecordsAccountNumberFilterEle.innerHTML = "";

          for (const bankRecordsStat of bankRecordStats) {

            bankingYearMin = Math.min(bankRecordsStat.bankingYearMin, bankingYearMin);

            const accountNumber = cityssm.escapeHTML(bankRecordsStat.accountNumber);

            bankRecordsAccountNumberFilterEle.insertAdjacentHTML(
              "beforeend",
              "<option value=\"" + accountNumber + "\">" +
              accountNumber +
              " (From " + bankRecordsStat.bankingYearMin.toString() + " to " + bankRecordsStat.bankingYearMax.toString() + ")" +
              "</option>"
            );
          }
        }

        // Banking Year Select

        bankRecordsBankingYearFilterEle.innerHTML = "";

        for (let year = currentYear; year >= bankingYearMin; year -= 1) {

          bankRecordsBankingYearFilterEle.insertAdjacentHTML("beforeend", "<option value=\"" + year.toString() + "\">" +
            year.toString() +
            "</option>");
        }

        getBankRecordsFn();

      });
  };

  bankRecordsBankingYearFilterEle.addEventListener("change", getBankRecordsFn);
  bankRecordsAccountNumberFilterEle.addEventListener("change", getBankRecordsFn);

  if (canCreate) {

    const openBankRecordEditModalFn = (buttonEvent: Event) => {

      const isNavBlockedByPage = cityssm.isNavBlockerEnabled();

      let bankRecordEditCloseModalFn: () => void;
      let isUpdate = false;
      let lockKeyFields = false;
      let accountNumberIsBlank = true;

      const submitBankRecordEditFn = (formEvent: Event) => {

        formEvent.preventDefault();

        cityssm.postJSON(urlPrefix + "/organizations/" + (isUpdate ? "doEditBankRecord" : "doAddBankRecord"),
          formEvent.currentTarget,
          (resultJSON: { success: boolean; message?: string }) => {

            if (resultJSON.success) {

              bankRecordEditCloseModalFn();

              if (isUpdate || (lockKeyFields && !accountNumberIsBlank)) {

                getBankRecordsFn();

              } else {

                bankRecordsFiltersLoaded = false;
                loadBankRecordFiltersFn();

              }

            } else {

              cityssm.alertModal("Record Not Saved", resultJSON.message, "OK", "danger");
            }
          }
        );

      };

      const deleteBankRecordFn = (deleteButtonEvent: Event) => {

        deleteButtonEvent.preventDefault();

        const recordIndex = (deleteButtonEvent.currentTarget as HTMLButtonElement).getAttribute("data-record-index");

        const deleteFn = () => {

          cityssm.postJSON(urlPrefix + "/organizations/doDeleteBankRecord", {
            organizationID,
            recordIndex
          }, () => {

            bankRecordEditCloseModalFn();
            getBankRecordsFn();
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
      const buttonEle = buttonEvent.currentTarget as HTMLButtonElement;

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

        const tdEle = buttonEle.closest("td");

        recordIndex = tdEle.getAttribute("data-record-index");

        bankingYear = parseInt(bankRecordsBankingYearFilterEle.value, 10);

        // If no record exists, use default data
        if (recordIndex === "") {

          bankingMonth = parseInt(tdEle.closest("tr").getAttribute("data-banking-month"), 10);

          bankRecordType = tdEle.getAttribute("data-bank-record-type");

        } else {

          const recordObj = bankRecordsCache.get(parseInt(recordIndex, 10));

          isUpdate = true;
          bankingMonth = recordObj.bankingMonth;
          bankRecordType = recordObj.bankRecordType;
          recordIsNA = recordObj.recordIsNA;
          recordDateString = recordObj.recordDateString;
          recordNote = recordObj.recordNote;

        }

      }

      cityssm.openHtmlModal("organization-bankRecordEdit", {

        onshow(): void {

          cityssm.enableNavBlocker();

          (document.getElementById("bankRecordEdit--organizationID") as HTMLInputElement).value = organizationID;
          (document.getElementById("bankRecordEdit--recordIndex") as HTMLInputElement).value = recordIndex;

          const accountNumberEle = document.getElementById("bankRecordEdit--accountNumber") as HTMLInputElement;
          accountNumberEle.value = accountNumber;

          const bankingYearEle = document.getElementById("bankRecordEdit--bankingYear") as HTMLInputElement;
          bankingYearEle.value = bankingYear.toString();
          bankingYearEle.setAttribute("max", currentYear.toString());

          const bankingMonthEle = document.getElementById("bankRecordEdit--bankingMonth") as HTMLInputElement;
          bankingMonthEle.value = bankingMonth.toString();

          const bankRecordTypeEle = document.getElementById("bankRecordEdit--bankRecordType") as HTMLSelectElement;

          for (const config_bankRecordType of (exports.config_bankRecordTypes as configTypes.ConfigBankRecordType[])) {

            bankRecordTypeEle.insertAdjacentHTML(
              "beforeend",
              "<option value=\"" + config_bankRecordType.bankRecordType + "\">" +
              config_bankRecordType.bankRecordTypeName +
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

          const recordDateStringEle = document.getElementById("bankRecordEdit--recordDateString") as HTMLInputElement;

          recordDateStringEle.value = recordDateString;
          recordDateStringEle.setAttribute("max", currentDateString);

          if (recordIsNA) {
            document.getElementById("bankRecordEdit--recordIsNA").setAttribute("checked", "checked");
          }

          (document.getElementById("bankRecordEdit--recordNote") as HTMLTextAreaElement).value = recordNote;

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
        onshown(modalEle: HTMLElement, closeModalFn: () => void): void {

          bankRecordEditCloseModalFn = closeModalFn;
          modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitBankRecordEditFn);
        },
        onremoved(): void {
          if (!isNavBlockedByPage) {
            cityssm.disableNavBlocker();
          }
        }
      });
    };

    /*
     * Main "Add" Button
     */

    const addRecordButtonEle = document.getElementById("is-add-bank-record-button");

    if (addRecordButtonEle) {
      addRecordButtonEle.addEventListener("click", openBankRecordEditModalFn);
    }

    /*
     * Single Record Edit
     */

    const buttonEles = bankRecordsTableEle.getElementsByClassName("is-bank-record-button");

    for (const buttonEle of buttonEles) {
      buttonEle.addEventListener("click", openBankRecordEditModalFn);
    }

    /*
     * Multiple Record Edit
     */

    const openBankRecordMonthEditModalFn = (buttonEvent: Event) => {

      // Ensure an account number is available

      const accountNumber = bankRecordsAccountNumberFilterEle.value;

      if (accountNumber === "") {
        cityssm.alertModal("No Account Number Set",
          "Please add at least one bank record with the account number you are looking to record.",
          "OK",
          "warning");

        return;
      }

      // Sync functions

      let recordDateRowIndex = -1;

      const syncFn_enableDateField = (rowIndexString: string) => {
        const recordDateEle = document.getElementById("bankRecordMonthEdit--recordDateString-" + rowIndexString) as HTMLInputElement;
        recordDateEle.classList.remove("is-readonly");
        recordDateEle.readOnly = false;
      };

      const syncFn_disableDateField = (rowIndexString: string) => {
        const recordDateEle = document.getElementById("bankRecordMonthEdit--recordDateString-" + rowIndexString) as HTMLInputElement;
        recordDateEle.classList.add("is-readonly");
        recordDateEle.readOnly = true;
        recordDateEle.value = (document.getElementById("bankRecordMonthEdit--recordDateString-0") as HTMLInputElement).value;
      };

      const syncFn_toggleDateField = (changeEvent: Event) => {

        const syncRecordDateCheckboxEle = changeEvent.currentTarget as HTMLInputElement;

        const rowIndexString = syncRecordDateCheckboxEle.value;

        if (syncRecordDateCheckboxEle.checked) {
          syncFn_disableDateField(rowIndexString);
        } else {
          syncFn_enableDateField(rowIndexString);
        }
      };

      const syncFn_copyToSyncedDates = () => {

        const recordDateString = (document.getElementById("bankRecordMonthEdit--recordDateString-0") as HTMLInputElement).value;

        for (let i = 1; i <= recordDateRowIndex; i += 1) {

          if ((document.getElementById("bankRecordMonthEdit--syncRecordDate-" + i.toString()) as HTMLInputElement).checked) {
            (document.getElementById("bankRecordMonthEdit--recordDateString-" + i.toString()) as HTMLInputElement).value = recordDateString;
          }
        }
      };

      const dateFn_setToToday = (clickEvent: Event) => {

        const rowIndexString = (clickEvent.currentTarget as HTMLButtonElement).value;

        if (rowIndexString === "0" ||
          !(document.getElementById("bankRecordMonthEdit--syncRecordDate-" + rowIndexString) as HTMLInputElement).checked) {

          (document.getElementById("bankRecordMonthEdit--recordDateString-" + rowIndexString) as HTMLInputElement).value = cityssm.dateToString(new Date());

          if (rowIndexString === "0") {
            syncFn_copyToSyncedDates();
          }
        } else {
          cityssm.alertModal("Date Not Changed",
            "This date is synced with the date on the first band record type.",
            "OK",
            "warning");
        }
      };

      // Submit function

      let closeBankRecordMonthEditModalFn: () => void;

      const submitFn = (formEvent: Event) => {
        formEvent.preventDefault();

        cityssm.postJSON(urlPrefix + "/organizations/doUpdateBankRecordsByMonth",
          formEvent.currentTarget,
          (responseJSON: {
            success: boolean;
            message?: string;
          }) => {

            if (responseJSON.success) {
              closeBankRecordMonthEditModalFn();
              getBankRecordsFn();
            }
          });
      };

      // Track if navigation is already blocked

      const isNavBlockedByPage = cityssm.isNavBlockerEnabled();

      // Get date details

      const bankingYear = parseInt(bankRecordsBankingYearFilterEle.value, 10);

      const trEle = (buttonEvent.currentTarget as HTMLButtonElement).closest("tr");

      const bankingMonth = parseInt(trEle.getAttribute("data-banking-month"), 10);

      // Get data for the month

      const tdEles = trEle.getElementsByTagName("td");

      const bankRecordTypeToRecord = new Map<string, recordTypes.OrganizationBankRecord>();

      for (const tdEle of tdEles) {

        const recordIndexString = tdEle.getAttribute("data-record-index");

        if (recordIndexString !== "") {
          const bankRecord = bankRecordsCache.get(parseInt(recordIndexString, 10));
          bankRecordTypeToRecord.set(bankRecord.bankRecordType, bankRecord);
        }
      }

      cityssm.openHtmlModal("organization-bankRecordMonthEdit", {
        onshow: () => {

          cityssm.enableNavBlocker();

          // Set organization and month data

          (document.getElementById("bankRecordMonthEdit--organizationID") as HTMLInputElement).value = organizationID;

          (document.getElementById("bankRecordMonthEdit--accountNumber") as HTMLInputElement).value = accountNumber;
          (document.getElementById("bankRecordMonthEdit--bankingYear") as HTMLInputElement).value = bankingYear.toString();
          (document.getElementById("bankRecordMonthEdit--bankingMonth") as HTMLInputElement).value = bankingMonth.toString();

          (document.getElementById("bankRecordMonthEdit--accountNumber-span") as HTMLSpanElement).innerText = accountNumber;
          (document.getElementById("bankRecordMonthEdit--bankingYear-span") as HTMLSpanElement).innerText = bankingYear.toString();
          (document.getElementById("bankRecordMonthEdit--bankingMonth-span") as HTMLSpanElement).innerText = bankingMonth.toString();

          // Create record type fields

          const recordTypeContainerEle = document.getElementById("container--bankRecordMonthEdit-recordTypes");

          for (const config_bankRecordType of (exports.config_bankRecordTypes as configTypes.ConfigBankRecordType[])) {

            recordDateRowIndex += 1;

            const rowIndexString = recordDateRowIndex.toString();

            recordTypeContainerEle.insertAdjacentHTML(
              "beforeend",
              "<hr />");

            recordTypeContainerEle.insertAdjacentHTML("beforeend",
              "<input id=\"bankRecordMonthEdit--recordIndex-" + rowIndexString + "\" name=\"recordIndex-" + rowIndexString + "\" type=\"hidden\" value=\"\" />");

            recordTypeContainerEle.insertAdjacentHTML("beforeend",
              "<input name=\"bankRecordType-" + rowIndexString + "\" type=\"hidden\" value=\"" + cityssm.escapeHTML(config_bankRecordType.bankRecordType) + "\" />");

            recordTypeContainerEle.insertAdjacentHTML(
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

            recordTypeContainerEle.insertAdjacentHTML(
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

              (document.getElementById("bankRecordMonthEdit--recordIndex-" + rowIndexString) as HTMLInputElement).value = bankRecord.recordIndex.toString();

              if (bankRecord.recordIsNA) {
                (document.getElementById("bankRecordMonthEdit--recordIsNA-" + rowIndexString) as HTMLInputElement).checked = true;
              }

              (document.getElementById("bankRecordMonthEdit--recordDateString-" + rowIndexString) as HTMLInputElement).value = bankRecord.recordDateString;
              (document.getElementById("bankRecordMonthEdit--recordNote-" + rowIndexString) as HTMLInputElement).value = bankRecord.recordNote;
            }

            // Sync setup

            if (recordDateRowIndex !== 0) {

              const syncRecordDateCheckboxEle = document.getElementById("bankRecordMonthEdit--syncRecordDate-" + rowIndexString) as HTMLInputElement;

              syncRecordDateCheckboxEle.addEventListener("change", syncFn_toggleDateField);

              // Disable sync

              const mainRecordDateString = (document.getElementById("bankRecordMonthEdit--recordDateString-0") as HTMLInputElement).value;

              if ((bankRecord && bankRecord.recordDateString !== mainRecordDateString) || (!bankRecord && mainRecordDateString !== "")) {
                syncRecordDateCheckboxEle.checked = false;
                syncFn_enableDateField(rowIndexString);
              }
            }

            // Today button

            document.getElementById("bankRecordMonthEdit--setToToday-" + rowIndexString).addEventListener("click", dateFn_setToToday);
          }

          (document.getElementById("bankRecordMonthEdit--bankRecordTypeIndex") as HTMLInputElement).value = recordDateRowIndex.toString();

          if (recordDateRowIndex >= 0) {
            document.getElementById("bankRecordMonthEdit--recordDateString-0").addEventListener("change", syncFn_copyToSyncedDates);
          }

        },
        onshown: (_modalEle, closeModalFn) => {

          document.getElementById("form--bankRecordMonthEdit").addEventListener("submit", submitFn);
          closeBankRecordMonthEditModalFn = closeModalFn;
        },
        onremoved: () => {
          if (!isNavBlockedByPage) {
            cityssm.disableNavBlocker();
          }
        }
      });
    };

    const monthButtonEles = bankRecordsTableEle.getElementsByClassName("is-bank-record-month-button");

    for (const buttonEle of monthButtonEles) {
      buttonEle.addEventListener("click", openBankRecordMonthEditModalFn);
    }
  }

  /*
   * Tabs
   */

  llm.initializeTabs(document.getElementById("tabs--organization"), {
    onshown: (tabContentEle) => {

      if (tabContentEle.id === "organizationTabContent--bankRecords" && !bankRecordsFiltersLoaded) {
        bankRecordsFiltersLoaded = true;
        loadBankRecordFiltersFn();
      }
    }
  });
})();
