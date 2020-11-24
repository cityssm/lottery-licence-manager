import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


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
              window.location.href = "/licences/" + licenceID;
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


  // Bank Info Lookup


  document.getElementById("is-bank-information-lookup-button").addEventListener("click", (clickEvent) => {

    clickEvent.preventDefault();

    let bankInfoCloseModalFn: Function;
    let savedBankInfoList: Array<{
      bank_name: string;
      bank_address: string;
      bank_accountNumber: string;
      eventDateMax: number;
      eventDateMaxString: string;
    }>;

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
      }, (bankInfoList) => {

        savedBankInfoList = bankInfoList;

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


  // Net Proceeds Calculation

  const costs_receipts_ele = document.getElementById("event--costs_receipts") as HTMLInputElement;
  const costs_admin_ele = document.getElementById("event--costs_admin") as HTMLInputElement;
  const costs_prizesAwarded_ele = document.getElementById("event--costs_prizesAwarded") as HTMLInputElement;

  const costs_netProceeds_ele = document.getElementById("event--costs_netProceeds") as HTMLInputElement;
  const costs_amountDonated_ele = document.getElementById("event--costs_amountDonated") as HTMLInputElement;

  const refreshNetProceedsFn = () => {

    const netProceeds = (parseFloat(costs_receipts_ele.value || "0") -
      parseFloat(costs_admin_ele.value || "0") -
      parseFloat(costs_prizesAwarded_ele.value || "0")).toFixed(2);

    costs_netProceeds_ele.value = netProceeds;
    costs_amountDonated_ele.setAttribute("max", netProceeds);

  };

  costs_receipts_ele.addEventListener("keyup", refreshNetProceedsFn);
  costs_admin_ele.addEventListener("keyup", refreshNetProceedsFn);
  costs_prizesAwarded_ele.addEventListener("keyup", refreshNetProceedsFn);

})();
