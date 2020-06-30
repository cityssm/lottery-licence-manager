import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";
import type * as llmTypes from "../../helpers/llmTypes";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


(() => {

  const canCreate = document.getElementsByTagName("main")[0].getAttribute("data-can-create") === "true";

  /*
   * Remarks
   */

  const remarksContainerEle = document.getElementById("container--remarks");

  // Update remarks

  if (canCreate) {

    const organizationID = parseInt(remarksContainerEle.getAttribute("data-organization-id"), 10);

    const editRemarkFn = (buttonEvent: Event) => {

      const remarkIndex =
        parseInt((<HTMLButtonElement>buttonEvent.currentTarget).getAttribute("data-remark-index"), 10);

      llm.organizationRemarks.openEditRemarkModal(organizationID, remarkIndex, refreshRemarksFn);
    };

    const deleteRemarkFn = (buttonEvent: Event) => {

      const remarkIndex =
        parseInt((<HTMLButtonElement>buttonEvent.currentTarget).getAttribute("data-remark-index"), 10);

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

  const remarkSearchStrEle = <HTMLInputElement>document.getElementById("remark--searchStr");

  if (remarkSearchStrEle) {

    remarkSearchStrEle.value = "";

    const remarkDisplayCountEle = document.getElementById("remark--displayCount");

    const remarkBlockEles = <HTMLCollectionOf<HTMLElement>>
      remarksContainerEle.getElementsByClassName("is-remark-block");

    remarkSearchStrEle.addEventListener("keyup", () => {

      const searchStrSplit = remarkSearchStrEle.value
        .trim()
        .toLowerCase()
        .split(" ");

      let displayCount = remarkBlockEles.length;

      for (const remarkBlockEle of remarkBlockEles) {

        const remark = (<HTMLElement>remarkBlockEle.getElementsByClassName("is-remark")[0]).innerText
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

  let bankRecordsCache = {};

  const bankRecordsBankingYearFilterEle = <HTMLSelectElement>document.getElementById("bankRecordFilter--bankingYear");
  const bankRecordsAccountNumberFilterEle =
    <HTMLSelectElement>document.getElementById("bankRecordFilter--accountNumber");

  const bankRecordsTableEle = <HTMLTableElement>document.getElementById("table--bankRecords");

  const organizationID = bankRecordsTableEle.getAttribute("data-organization-id");

  const clearBankRecordsTableFn = () => {

    bankRecordsCache = {};

    bankRecordsTableEle.classList.remove("has-status-loaded");
    bankRecordsTableEle.classList.add("has-status-loading");

    const buttonEles = bankRecordsTableEle.getElementsByClassName("is-bank-record-button");

    for (const buttonEle of buttonEles) {

      buttonEle.classList.remove("is-success");
      buttonEle.classList.remove("is-info");

      buttonEle.innerHTML = "<span class=\"icon\">" +
        "<i class=\"fas fa-minus has-text-grey-lighter\" aria-hidden=\"true\"></i>" +
        "</span><br />" +
        "<small>No Record Recorded</small>";

      buttonEle.setAttribute("data-record-index", "");
    }
  };

  const getBankRecordsFn = () => {

    clearBankRecordsTableFn();

    const processRecordsFn = (bankRecords: llmTypes.OrganizationBankRecord[]) => {

      for (const bankRecord of bankRecords) {

        bankRecordsCache[bankRecord.recordIndex] = bankRecord;

        const buttonEle = bankRecordsTableEle
          .querySelector("[data-banking-month='" + bankRecord.bankingMonth.toString() + "']")
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
            (bankRecord.recordNote === ""
              ? ""
              : " <span class=\"ml-2\" data-tooltip=\"" + cityssm.escapeHTML(bankRecord.recordNote) + "\">" +
              "<i class=\"fas fa-sticky-note\" aria-hidden=\"true\"></i>" +
              "</span>");

        } else {

          buttonEle.classList.add("is-success");

          buttonEle.innerHTML =
            "<i class=\"fas fa-check\" aria-hidden=\"true\"></i>" +
            "<br />" +
            "<small>Recorded " + bankRecord.recordDateString + "</small>" +
            (bankRecord.recordNote === ""
              ? ""
              : " <span class=\"ml-2\" data-tooltip=\"" + cityssm.escapeHTML(bankRecord.recordNote) + "\">" +
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
        organizationID,
        bankingYear: bankRecordsBankingYearFilterEle.value,
        accountNumber: bankRecordsAccountNumberFilterEle.value
      }, processRecordsFn);
    }
  };

  const loadBankRecordFiltersFn = () => {

    cityssm.postJSON("/organizations/doGetBankRecordStats", {
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

      let bankRecordEditCloseModalFn: () => void;
      let isUpdate = false;
      let lockKeyFields = false;
      let accountNumberIsBlank = true;

      const submitBankRecordEditFn = (formEvent: Event) => {

        formEvent.preventDefault();

        cityssm.postJSON(
          "/organizations/" + (isUpdate ? "doEditBankRecord" : "doAddBankRecord"),
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

        const recordIndex = (<HTMLButtonElement>deleteButtonEvent.currentTarget).getAttribute("data-record-index");

        const deleteFn = () => {

          cityssm.postJSON("/organizations/doDeleteBankRecord", {
            organizationID: organizationID,
            recordIndex: recordIndex
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

        onshow(): void {

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

          for (const config_bankRecordType of (<llmTypes.ConfigBankRecordType[]>exports.config_bankRecordTypes)) {

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
        onshown(modalEle: HTMLElement, closeModalFn: () => void): void {

          bankRecordEditCloseModalFn = closeModalFn;
          modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitBankRecordEditFn);
        }
      });
    };

    const buttonEles = bankRecordsTableEle.getElementsByTagName("button");

    for (const buttonEle of buttonEles) {
      buttonEle.addEventListener("click", openBankRecordEditModalFn);
    }

    document.getElementById("is-add-bank-record-button").addEventListener("click", openBankRecordEditModalFn);
  }

  /*
   * Tabs
   */

  llm.initializeTabs(document.getElementById("tabs--organization"), {
    onshown(tabContentEle: HTMLElement): void {

      if (tabContentEle.id === "organizationTabContent--bankRecords" && !bankRecordsFiltersLoaded) {
        bankRecordsFiltersLoaded = true;
        loadBankRecordFiltersFn();
      }
    }
  });
})();
