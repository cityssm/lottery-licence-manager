import type { PastEventBankingInformation } from "../helpers/licencesDB/getPastEventBankingInformation";
import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;

(() => {

  const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");

  const eventDateNavEle = document.getElementById("eventNav--eventDate") as HTMLSelectElement;

  const formEle = document.getElementById("form--event") as HTMLFormElement;
  const formMessageEle = document.getElementById("container--form-message");

  const licenceID = (document.getElementById("event--licenceID") as HTMLInputElement).value;
  const eventDate = (document.getElementById("event--eventDate") as HTMLInputElement).value;


  formEle.addEventListener("submit", (formEvent) => {

    formEvent.preventDefault();

    formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    cityssm.postJSON(urlPrefix + "/events/doSave",
      formEle,
      (responseJSON: { success: boolean; message?: string }) => {

        if (responseJSON.success) {

          cityssm.disableNavBlocker();

          if (eventDateNavEle) {
            eventDateNavEle.removeAttribute("disabled");
          }
        }

        formMessageEle.innerHTML = "";

        cityssm.alertModal(
          responseJSON.message,
          "",
          "OK",
          responseJSON.success ? "success" : "danger"
        );
      }
    );
  });

  document.getElementById("is-delete-event-button").addEventListener("click", (clickEvent) => {

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

  const setUnsavedChangesFn = () => {

    cityssm.enableNavBlocker();

    if (eventDateNavEle) {
      eventDateNavEle.setAttribute("disabled", "disabled");
    }

    formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";
  };

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const inputEles = formEle.querySelectorAll("input, select, textarea") as
    NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

  for (const inputEle of inputEles) {
    if (inputEle.name !== "") {
      inputEle.addEventListener("change", setUnsavedChangesFn);
    }
  }


  /*
   * Bank Info Lookup
   */


  document.getElementById("is-bank-information-lookup-button").addEventListener("click", (clickEvent) => {

    clickEvent.preventDefault();

    let bankInfoCloseModalFn: Function;
    let savedBankInfoList: PastEventBankingInformation[];

    const setPastBankInformationFn = (bankInfoClickEvent: Event) => {

      bankInfoClickEvent.preventDefault();

      const listIndex =
        parseInt((bankInfoClickEvent.currentTarget as HTMLAnchorElement).getAttribute("data-list-index"), 10);

      const record = savedBankInfoList[listIndex];

      (document.getElementById("event--bank_name") as HTMLInputElement).value = record.bank_name;
      (document.getElementById("event--bank_address") as HTMLInputElement).value = record.bank_address;
      (document.getElementById("event--bank_accountNumber") as HTMLInputElement).value = record.bank_accountNumber;

      setUnsavedChangesFn();

      bankInfoCloseModalFn();
    };

    const getPastBankInformationFn = () => {

      const containerEle = document.getElementById("container--bankInformationLookup");

      cityssm.postJSON(urlPrefix + "/events/doGetPastBankInformation", {
        licenceID
      }, (bankInfoList: PastEventBankingInformation[]) => {

        savedBankInfoList = bankInfoList;

        if (bankInfoList.length === 0) {
          containerEle.innerHTML = "<div class=\"message is-info\">" +
            "<p class=\"message-body\">There is no previously used banking information available.</p>" +
            "</div>";
          return;
        }

        const listEle = document.createElement("div");
        listEle.className = "panel mb-3";

        savedBankInfoList.forEach((record, index) => {

          const listItemEle = document.createElement("a");

          listItemEle.className = "panel-block is-block";
          listItemEle.setAttribute("data-list-index", index.toString());

          listItemEle.innerHTML = `<div class="columns">
            <div class="column">${cityssm.escapeHTML(record.bank_name)}</div>
            <div class="column">${cityssm.escapeHTML(record.bank_address)}</div>
            <div class="column">${cityssm.escapeHTML(record.bank_accountNumber)}</div>
            </div>
            <div class="has-text-right">
            <span class="tag is-info" data-tooltip="Last Used Event Date">
            ${record.eventDateMaxString}
            </span>
            </div>`;

          listItemEle.addEventListener("click", setPastBankInformationFn);

          listEle.insertAdjacentElement("beforeend", listItemEle);

        });

        cityssm.clearElement(containerEle);

        containerEle.insertAdjacentElement("beforeend", listEle);

      });

    };

    cityssm.openHtmlModal("event-bankInformationLookup", {

      onshow: getPastBankInformationFn,

      onshown(_modalEle: HTMLElement, closeModalFn: () => void): void {
        bankInfoCloseModalFn = closeModalFn;
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

  const costs_tableEle = document.getElementById("event--costs");

  const costsFn_calculateRow = (keyupEvent: Event) => {

    let netProceeds = 0;

    const trEle = (keyupEvent.currentTarget as HTMLElement).closest("tr");

    const inputEles = trEle.getElementsByTagName("input");

    for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {

      const value = parseFloat(inputEles[inputIndex].value || "0");

      netProceeds += (inputEles[inputIndex].getAttribute("data-cost") === "receipts" ? 1 : -1) * value;
    }

    document.getElementById("event--costs_netProceeds-" + trEle.getAttribute("data-ticket-type"))
      .innerHTML = llm.formatDollarsAsHTML(netProceeds);

  };

  const costsFn_calculateTotal = (columnName: "receipts" | "admin" | "prizesAwarded") => {

    costs_sums[columnName] = 0;

    costs_tableEle.querySelectorAll("input[data-cost='" + columnName + "']").forEach((inputEle: HTMLInputElement) => {
      costs_sums[columnName] += parseFloat(inputEle.value || "0");
    });

    document.getElementById("event--costs_" + columnName + "Sum").innerHTML = llm.formatDollarsAsHTML(costs_sums[columnName]);

    document.getElementById("event--costs_netProceedsSum").innerHTML =
      llm.formatDollarsAsHTML(costs_sums.receipts - costs_sums.admin - costs_sums.prizesAwarded);
  };

  const costsFn_calculateReceipts = () => {
    costsFn_calculateTotal("receipts");
  };

  const costsFn_calculateAdmin = () => {
    costsFn_calculateTotal("admin");
  };

  const costsFn_calculatePrizesAwarded = () => {
    costsFn_calculateTotal("prizesAwarded");
  };

  const costsInputEles = costs_tableEle.getElementsByTagName("input");

  for (let inputIndex = 0; inputIndex < costsInputEles.length; inputIndex += 1) {

    const inputEle = costsInputEles[inputIndex];

    inputEle.addEventListener("keyup", costsFn_calculateRow);

    switch (inputEle.getAttribute("data-cost")) {

      case "receipts":
        inputEle.addEventListener("keyup", costsFn_calculateReceipts);
        break;

      case "admin":
        inputEle.addEventListener("keyup", costsFn_calculateAdmin);
        break;

      case "prizesAwarded":
        inputEle.addEventListener("keyup", costsFn_calculatePrizesAwarded);
        break;
    }
  }

  costsFn_calculateTotal("receipts");
  costsFn_calculateTotal("admin");
  costsFn_calculateTotal("prizesAwarded");
})();
