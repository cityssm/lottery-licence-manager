/* eslint-disable unicorn/filename-case */

import type { PastEventBankingInformation } from "../helpers/licencesDB/getPastEventBankingInformation";
import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;

(() => {

  const urlPrefix = document.querySelector("main").getAttribute("data-url-prefix");

  const eventDateNavElement = document.querySelector("#eventNav--eventDate") as HTMLSelectElement;

  const formElement = document.querySelector("#form--event") as HTMLFormElement;
  const formMessageElement = document.querySelector("#container--form-message");

  const licenceID = (document.querySelector("#event--licenceID") as HTMLInputElement).value;
  const eventDate = (document.querySelector("#event--eventDate") as HTMLInputElement).value;


  formElement.addEventListener("submit", (formEvent) => {

    formEvent.preventDefault();

    formMessageElement.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    cityssm.postJSON(urlPrefix + "/events/doSave",
      formElement,
      (responseJSON: { success: boolean; message?: string }) => {

        if (responseJSON.success) {

          cityssm.disableNavBlocker();

          if (eventDateNavElement) {
            eventDateNavElement.removeAttribute("disabled");
          }
        }

        formMessageElement.innerHTML = "";

        cityssm.alertModal(
          responseJSON.message,
          "",
          "OK",
          responseJSON.success ? "success" : "danger"
        );
      }
    );
  });

  document.querySelector("#is-delete-event-button").addEventListener("click", (clickEvent) => {

    clickEvent.preventDefault();

    cityssm.confirmModal(
      "Delete Event?",
      "Are you sure you want to delete this event?",
      "Yes, Delete",
      "danger",
      () => {

        cityssm.postJSON(urlPrefix + "/events/doDelete", {
          licenceID,
          eventDate
        },
          (responseJSON: { success: boolean }) => {

            if (responseJSON.success) {
              cityssm.disableNavBlocker();
              window.location.href = urlPrefix + "/licences/" + licenceID;
            }
          }
        );
      }
    );
  });


  // Nav blocker

  const setUnsavedChangesFunction = () => {

    cityssm.enableNavBlocker();

    if (eventDateNavElement) {
      eventDateNavElement.setAttribute("disabled", "disabled");
    }

    formMessageElement.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";
  };

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const inputElements = formElement.querySelectorAll("input, select, textarea") as
    NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

  for (const inputElement of inputElements) {
    if (inputElement.name !== "") {
      inputElement.addEventListener("change", setUnsavedChangesFunction);
    }
  }


  /*
   * Bank Info Lookup
   */


  document.querySelector("#is-bank-information-lookup-button").addEventListener("click", (clickEvent) => {

    clickEvent.preventDefault();

    let bankInfoCloseModalFunction: () => void;
    let savedBankInfoList: PastEventBankingInformation[];

    const setPastBankInformationFunction = (bankInfoClickEvent: Event) => {

      bankInfoClickEvent.preventDefault();

      const listIndex =
        Number.parseInt((bankInfoClickEvent.currentTarget as HTMLAnchorElement).getAttribute("data-list-index"), 10);

      const record = savedBankInfoList[listIndex];

      (document.querySelector("#event--bank_name") as HTMLInputElement).value = record.bank_name;
      (document.querySelector("#event--bank_address") as HTMLInputElement).value = record.bank_address;
      (document.querySelector("#event--bank_accountNumber") as HTMLInputElement).value = record.bank_accountNumber;

      setUnsavedChangesFunction();

      bankInfoCloseModalFunction();
    };

    const getPastBankInformationFunction = () => {

      const containerElement = document.querySelector("#container--bankInformationLookup") as HTMLElement;

      cityssm.postJSON(urlPrefix + "/events/doGetPastBankInformation", {
        licenceID
      }, (bankInfoList: PastEventBankingInformation[]) => {

        savedBankInfoList = bankInfoList;

        if (bankInfoList.length === 0) {
          containerElement.innerHTML = "<div class=\"message is-info\">" +
            "<p class=\"message-body\">There is no previously used banking information available.</p>" +
            "</div>";
          return;
        }

        const listElement = document.createElement("div");
        listElement.className = "panel mb-3";

        for (const [index, record] of savedBankInfoList.entries()) {

          const listItemElement = document.createElement("a");

          listItemElement.className = "panel-block is-block";
          listItemElement.dataset.listIndex = index.toString();

          listItemElement.innerHTML = `<div class="columns">
            <div class="column">${cityssm.escapeHTML(record.bank_name)}</div>
            <div class="column">${cityssm.escapeHTML(record.bank_address)}</div>
            <div class="column">${cityssm.escapeHTML(record.bank_accountNumber)}</div>
            </div>
            <div class="has-text-right">
            <span class="tag is-info" data-tooltip="Last Used Event Date">
            ${record.eventDateMaxString}
            </span>
            </div>`;

          listItemElement.addEventListener("click", setPastBankInformationFunction);

          listElement.append(listItemElement);

        }

        cityssm.clearElement(containerElement);

        containerElement.append(listElement);

      });

    };

    cityssm.openHtmlModal("event-bankInformationLookup", {

      onshow: getPastBankInformationFunction,

      onshown(_modalElement: HTMLElement, closeModalFunction: () => void): void {
        bankInfoCloseModalFunction = closeModalFunction;
      }
    });
  });


  /*
   * Net Proceeds Calculation
   */


  const costs_sums = {
    receipts: 0,
    admin: 0,
    prizesAwarded: 0
  };

  const costs_tableElement = document.querySelector("#event--costs");

  const costsFunction_calculateRow = (keyupEvent: Event) => {

    let netProceeds = 0;

    const trElement = (keyupEvent.currentTarget as HTMLElement).closest("tr");

    const inputElements = trElement.querySelectorAll("input");

    for (const element of inputElements) {

      const value = Number.parseFloat(element.value || "0");

      netProceeds += (element.getAttribute("data-cost") === "receipts" ? 1 : -1) * value;
    }

    document.querySelector("#event--costs_netProceeds-" + trElement.getAttribute("data-ticket-type"))
      .innerHTML = llm.formatDollarsAsHTML(netProceeds);

  };

  const costsFunction_calculateTotal = (columnName: "receipts" | "admin" | "prizesAwarded") => {

    costs_sums[columnName] = 0;

    const inputElements = costs_tableElement.querySelectorAll("input[data-cost='" + columnName + "']") as NodeListOf<HTMLInputElement>;

    for (const inputElement of inputElements) {
      costs_sums[columnName] += Number.parseFloat(inputElement.value || "0");
    }

    document.querySelector("#event--costs_" + columnName + "Sum").innerHTML = llm.formatDollarsAsHTML(costs_sums[columnName]);

    document.querySelector("#event--costs_netProceedsSum").innerHTML =
      llm.formatDollarsAsHTML(costs_sums.receipts - costs_sums.admin - costs_sums.prizesAwarded);
  };

  const costsFunction_calculateReceipts = () => {
    costsFunction_calculateTotal("receipts");
  };

  const costsFunction_calculateAdmin = () => {
    costsFunction_calculateTotal("admin");
  };

  const costsFunction_calculatePrizesAwarded = () => {
    costsFunction_calculateTotal("prizesAwarded");
  };

  const costsInputElements = costs_tableElement.querySelectorAll("input");

  for (const inputElement of costsInputElements) {

    inputElement.addEventListener("keyup", costsFunction_calculateRow);

    switch (inputElement.getAttribute("data-cost")) {

      case "receipts":
        inputElement.addEventListener("keyup", costsFunction_calculateReceipts);
        break;

      case "admin":
        inputElement.addEventListener("keyup", costsFunction_calculateAdmin);
        break;

      case "prizesAwarded":
        inputElement.addEventListener("keyup", costsFunction_calculatePrizesAwarded);
        break;
    }
  }

  costsFunction_calculateTotal("receipts");
  costsFunction_calculateTotal("admin");
  costsFunction_calculateTotal("prizesAwarded");
})();
