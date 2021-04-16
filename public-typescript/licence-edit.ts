import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";

import type * as recordTypes from "../types/recordTypes";
import type * as configTypes from "../types/configTypes";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


(() => {

  const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");

  /*
   * FORM
   */

  const formEle = document.getElementById("form--licence") as HTMLFormElement;
  const formMessageEle = document.getElementById("container--form-message");
  const licenceID = (document.getElementById("licence--licenceID") as HTMLInputElement).value;

  const isCreate = licenceID === "";
  const isIssued = formEle.getAttribute("data-licence-is-issued") === "true";

  const refreshInputTypes = ["number", "date", "time"];

  let doRefreshAfterSave = false;
  let hasUnsavedChanges = false;

  const eventsContainerEle = document.getElementById("container--events");

  formEle.addEventListener("submit", (formEvent) => {

    formEvent.preventDefault();

    // Ensure at least one event

    const eventDateInputEles = eventsContainerEle.getElementsByTagName("input");

    if (eventDateInputEles.length === 0) {

      cityssm.alertModal("Event Date Error", "Please ensure there is at least one event date.", "OK", "warning");
      return;

    }

    // Ensure event dates are distinct

    formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    cityssm.postJSON(urlPrefix + "/licences/doSave",
      formEle,
      (responseJSON: { success: boolean; message?: string; licenceID?: number }) => {

        if (responseJSON.success) {

          cityssm.disableNavBlocker();
          hasUnsavedChanges = false;

        }

        if (responseJSON.success && isCreate) {

          window.location.href = urlPrefix + "/licences/" + responseJSON.licenceID.toString() + "/edit";

        } else if (responseJSON.success && doRefreshAfterSave) {

          window.location.reload();

        } else {

          formMessageEle.innerHTML = "";

          cityssm.alertModal(
            responseJSON.message, "", "OK",
            responseJSON.success ? "success" : "danger"
          );

          const removeInputEles = document.getElementsByClassName("is-removed-after-save");

          for (const removeInputEle of removeInputEles) {
            removeInputEle.remove();
          }
        }
      });
  });

  if (!isCreate) {

    document.getElementById("is-delete-licence-button").addEventListener("click", (clickEvent) => {

      clickEvent.preventDefault();

      const deleteFn = () => {
        cityssm.postJSON(urlPrefix + "/licences/doDelete", {
          licenceID
        },
          (responseJSON: { success: boolean }) => {

            if (responseJSON.success) {

              cityssm.disableNavBlocker();
              window.location.href = urlPrefix + "/licences";

            }
          }
        );
      };

      cityssm.confirmModal(
        "Delete Licence?",
        "Are you sure you want to delete this licence and all events associated with it?",
        "Yes, Delete",
        "danger",
        deleteFn
      );
    });
  }


  // Nav blocker

  const setDoRefreshAfterSaveFn = () => {
    doRefreshAfterSave = true;
  };

  const setUnsavedChangesFn = (changeEvent?: Event) => {

    cityssm.enableNavBlocker();

    hasUnsavedChanges = true;

    formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";

    if (!isCreate) {

      document.getElementById("is-add-transaction-button").setAttribute("disabled", "disabled");
      document.getElementById("is-disabled-transaction-message").classList.remove("is-hidden");

    }

    if (changeEvent) {

      const currentTargetType =
        (changeEvent.currentTarget instanceof HTMLInputElement ? changeEvent.currentTarget.type : "");

      if (refreshInputTypes.includes(currentTargetType)) {
        setDoRefreshAfterSaveFn();
      }
    }

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
   * EXTERNAL LICENCE NUMBER
   */


  const externalLicenceNumberUnlockBtnEle = document.getElementById("is-external-licence-number-unlock-button");

  if (externalLicenceNumberUnlockBtnEle) {

    externalLicenceNumberUnlockBtnEle.addEventListener("click", () => {

      const externalLicenceNumberEle = document.getElementById("licence--externalLicenceNumber");
      externalLicenceNumberEle.classList.remove("is-readonly");
      externalLicenceNumberEle.removeAttribute("readonly");
      externalLicenceNumberEle.focus();
    });
  }


  /*
   * ORGANIZATION LOOKUP
   */

  {
    let organizationList: recordTypes.Organization[] = [];

    let organizationLookupCloseModalFn: () => void;
    let organizationLookupSearchStrEle: HTMLInputElement;
    let organizationLookupResultsEle: HTMLElement;

    const organizationLookupFn_setOrganization = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const organizationEle = clickEvent.currentTarget as HTMLAnchorElement;

      (document.getElementById("licence--organizationID") as HTMLInputElement).value =
        organizationEle.getAttribute("data-organization-id");

      (document.getElementById("licence--organizationName") as HTMLInputElement).value =
        organizationEle.getAttribute("data-organization-name");

      organizationLookupCloseModalFn();

      setUnsavedChangesFn();

    };

    const organizationLookupFn_refreshResults = () => {

      const listEle = document.createElement("div");
      listEle.className = "panel";

      const searchStringSplit = organizationLookupSearchStrEle.value
        .trim()
        .toLowerCase()
        .split(" ");

      let displayLimit = 10;

      for (const organizationObj of organizationList) {

        if (displayLimit < 0) {
          break;
        }

        let doDisplayRecord = true;

        if (!organizationObj.isEligibleForLicences) {
          continue;
        }

        const organizationName = organizationObj.organizationName.toLowerCase();

        for (const searchStringPiece of searchStringSplit) {

          if (!organizationName.includes(searchStringPiece)) {

            doDisplayRecord = false;
            break;
          }
        }

        if (doDisplayRecord) {

          displayLimit -= 1;

          const listItemEle = document.createElement("a");
          listItemEle.className = "panel-block is-block";
          listItemEle.setAttribute("data-organization-id", organizationObj.organizationID.toString());
          listItemEle.setAttribute("data-organization-name", organizationObj.organizationName);
          listItemEle.setAttribute("href", "#");
          listItemEle.innerHTML = cityssm.escapeHTML(organizationObj.organizationName) + "<br />" +
            "<span class=\"is-size-7\">" +
            "<span class=\"icon\"><i class=\"fas fa-user\" aria-hidden=\"true\"></i></span> " +
            (organizationObj.representativeName
              ? cityssm.escapeHTML(organizationObj.representativeName)
              : "<span class=\"has-text-grey\">(No Representative)</span>") +
            "</span>";
          listItemEle.addEventListener("click", organizationLookupFn_setOrganization);

          listEle.appendChild(listItemEle);
        }
      }

      cityssm.clearElement(organizationLookupResultsEle);

      organizationLookupResultsEle.insertAdjacentElement("beforeend", listEle);
    };

    const organizationLookupFn_openModal = () => {

      cityssm.openHtmlModal("licence-organizationLookup", {

        onshow(): void {

          organizationLookupSearchStrEle =
            document.getElementById("organizationLookup--searchStr") as HTMLInputElement;
          organizationLookupSearchStrEle.addEventListener("keyup", organizationLookupFn_refreshResults);

          organizationLookupResultsEle = document.getElementById("container--organizationLookup");

          if (organizationList.length === 0) {

            cityssm.postJSON(urlPrefix + "/organizations/doGetAll",
              null,
              (organizationListRes: recordTypes.Organization[]) => {

                organizationList = organizationListRes;
                organizationLookupSearchStrEle.removeAttribute("disabled");
                organizationLookupFn_refreshResults();

                organizationLookupSearchStrEle.focus();
              }
            );

          } else {

            organizationLookupSearchStrEle.removeAttribute("disabled");
            organizationLookupFn_refreshResults();

            organizationLookupSearchStrEle.focus();
          }
        },

        onshown(_modalEle: HTMLElement, closeModalFn: () => void): void {

          organizationLookupCloseModalFn = closeModalFn;
          organizationLookupSearchStrEle.focus();
        },

        onremoved(): void {
          document.getElementById("is-organization-lookup-button").focus();
        }
      });
    };

    document.getElementById("is-organization-lookup-button").addEventListener("click", organizationLookupFn_openModal);
    document.getElementById("licence--organizationName").addEventListener("dblclick", organizationLookupFn_openModal);
  }


  /*
   * LOCATION LOOKUP
   */

  let locationList: recordTypes.Location[] = [];


  const loadLocationListFn = (callbackFn: () => void) => {

    if (locationList.length === 0) {

      cityssm.postJSON(urlPrefix + "/locations/doGetLocations",
        null,
        (locationResults: { locations: recordTypes.Location[] }) => {

          locationList = locationResults.locations;
          callbackFn();
        }
      );

    } else {
      callbackFn();
    }

  };


  {
    let locationLookup_closeModalFn: () => void;
    let locationLookup_searchStrEle: HTMLInputElement;
    let locationLookup_resultsEle: HTMLElement;


    const locationLookupFn_setLocation = (locationID: number, locationDisplayName: string) => {

      (document.getElementById("licence--locationID") as HTMLInputElement).value = locationID.toString();
      (document.getElementById("licence--locationDisplayName") as HTMLInputElement).value = locationDisplayName;

    };

    const locationLookupFn_setLocationFromExisting = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const locationEle = clickEvent.currentTarget as HTMLAnchorElement;

      locationLookupFn_setLocation(
        parseInt(locationEle.getAttribute("data-location-id"), 10),
        locationEle.getAttribute("data-location-display-name")
      );

      locationLookup_closeModalFn();

      setUnsavedChangesFn();

    };

    const locationLookupFn_refreshResults = () => {

      const listEle = document.createElement("div");
      listEle.className = "panel";

      const searchStringSplit = locationLookup_searchStrEle.value
        .trim()
        .toLowerCase()
        .split(" ");

      let displayLimit = 10;

      for (const locationObj of locationList) {

        if (displayLimit <= 0) {
          break;
        }

        let doDisplayRecord = true;

        const locationName = locationObj.locationName.toLowerCase();

        for (const searchStringPiece of searchStringSplit) {

          if (!locationName.includes(searchStringPiece)) {
            doDisplayRecord = false;
            break;
          }
        }

        if (doDisplayRecord) {

          displayLimit -= 1;

          const listItemEle = document.createElement("a");
          listItemEle.className = "panel-block is-block";
          listItemEle.setAttribute("data-location-id", locationObj.locationID.toString());
          listItemEle.setAttribute("data-location-display-name", locationObj.locationDisplayName);
          listItemEle.setAttribute("href", "#");

          listItemEle.innerHTML = "<div class=\"columns\">" +
            "<div class=\"column is-narrow\">" +
            "<i class=\"fas fa-map-marker-alt\" aria-hidden=\"true\"></i>" +
            "</div>" +
            "<div class=\"column\">" + cityssm.escapeHTML(locationObj.locationDisplayName) + "</div>" +

            (locationObj.locationName === ""
              ? ""
              : "<div class=\"column\">" + cityssm.escapeHTML(locationObj.locationAddress1) + "</div>") +

            "</div>";

          listItemEle.addEventListener("click", locationLookupFn_setLocationFromExisting);
          listEle.insertAdjacentElement("beforeend", listItemEle);
        }
      }

      cityssm.clearElement(locationLookup_resultsEle);

      locationLookup_resultsEle.insertAdjacentElement("beforeend", listEle);
    };

    const locationLookupFn_openModal = () => {

      cityssm.openHtmlModal("licence-locationLookup", {

        onshow(modalEle: HTMLElement): void {

          // Existing locations

          locationLookup_searchStrEle = document.getElementById("locationLookup--searchStr") as HTMLInputElement;
          locationLookup_searchStrEle.addEventListener("keyup", locationLookupFn_refreshResults);

          locationLookup_resultsEle = document.getElementById("container--locationLookup");

          loadLocationListFn(() => {

            locationLookup_searchStrEle.removeAttribute("disabled");
            locationLookupFn_refreshResults();
            locationLookup_searchStrEle.focus();
          });

          // New location

          llm.getDefaultConfigProperty("city", (defaultCity: string) => {

            if (defaultCity) {
              (document.getElementById("newLocation--locationCity") as HTMLInputElement).value = defaultCity;
            }

          });

          llm.getDefaultConfigProperty("province", (defaultProvince: string) => {

            if (defaultProvince) {
              (document.getElementById("newLocation--locationProvince") as HTMLInputElement).value = defaultProvince;
            }

          });

          document.getElementById("form--newLocation").addEventListener("submit", (formEvent) => {

            formEvent.preventDefault();

            cityssm.postJSON(urlPrefix + "/locations/doCreate",
              formEvent.currentTarget,
              (responseJSON: { success: boolean; locationID?: number; locationDisplayName?: string }) => {

                if (responseJSON.success) {

                  locationList = [];
                  locationLookupFn_setLocation(responseJSON.locationID, responseJSON.locationDisplayName);
                  locationLookup_closeModalFn();
                }
              }
            );
          });

          llm.initializeTabs(modalEle.querySelector(".tabs ul"));
        },
        onshown(_modalEle: HTMLElement, closeModalFn: () => void): void {
          locationLookup_closeModalFn = closeModalFn;
          locationLookup_searchStrEle.focus();
        },
        onremoved(): void {
          document.getElementById("is-location-lookup-button").focus();
        }
      });
    };

    document.getElementById("is-location-lookup-button").addEventListener("click", locationLookupFn_openModal);
    document.getElementById("licence--locationDisplayName").addEventListener("dblclick", locationLookupFn_openModal);
  }


  /*
   * END DATE
   */


  document.getElementById("is-endDateString-year-button").addEventListener("click", () => {

    const startDateStringSplit = (document.getElementById("licence--startDateString") as HTMLInputElement).value.split("-");

    const dateObj = new Date(parseInt(startDateStringSplit[0], 10) + 1,
      parseInt(startDateStringSplit[1], 10) - 1,
      parseInt(startDateStringSplit[2]));

    const endDateString =
      dateObj.getFullYear().toString() + "-" +
      ("00" + (dateObj.getMonth() + 1).toString()).slice(-2) + "-" +
      ("00" + dateObj.getDate().toString()).slice(-2);

    (document.getElementById("licence--endDateString") as HTMLInputElement).value = endDateString;

    setUnsavedChangesFn();
    setDoRefreshAfterSaveFn();
  });


  /*
   * TERMS AND CONDITIONS
   */

  {

    let termsConditionsList: recordTypes.TermsConditionsStat[] = [];

    const termsConditionsLookupModalEle = document.getElementById("is-termsConditions-lookup-modal");
    const termsConditionsLookupResultsEle = document.getElementById("container--termsConditionsPrevious");

    const termsConditionsLookupFn_setTermsConditions = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const termsConditionsIndex =
        parseInt((clickEvent.currentTarget as HTMLInputElement).getAttribute("data-terms-conditions-index"), 10);

      const termsConditionsEle = document.getElementById("licence--termsConditions") as HTMLTextAreaElement;
      termsConditionsEle.value = termsConditionsList[termsConditionsIndex].termsConditions;

      cityssm.hideModal(termsConditionsLookupModalEle);

      termsConditionsEle.focus();

      setUnsavedChangesFn();
    };

    document.getElementById("is-termsConditions-lookup-button").addEventListener("click", () => {

      termsConditionsList = [];
      cityssm.clearElement(termsConditionsLookupResultsEle);

      const organizationID = (document.getElementById("licence--organizationID") as HTMLInputElement).value;

      if (organizationID === "") {

        cityssm.alertModal(
          "No Organization Selected",
          "An organization must be selected before the previously used terms and conditions can be retrieved.",
          "OK",
          "warning"
        );

        return;
      }

      termsConditionsLookupResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
        "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
        "Loading previously used terms and conditions..." +
        "</p>";

      cityssm.postJSON(urlPrefix + "/licences/doGetDistinctTermsConditions", {
        organizationID
      },
        (termsConditionsListRes: recordTypes.TermsConditionsStat[]) => {

          termsConditionsList = termsConditionsListRes;

          if (termsConditionsList.length === 0) {

            termsConditionsLookupResultsEle.innerHTML = "<p class=\"has-text-centered\">" +
              "No previously used terms and conditions found for this organization." +
              "</p>";

          } else {

            const listEle = document.createElement("div");
            listEle.className = "panel mb-3";

            termsConditionsList.forEach((termsConditionsObj, termsConditionsIndex) => {

              const listItemEle = document.createElement("a");
              listItemEle.className = "panel-block is-block";
              listItemEle.setAttribute("data-terms-conditions-index", termsConditionsIndex.toString());

              listItemEle.innerHTML = "<p class=\"has-newline-chars\">" +
                cityssm.escapeHTML(termsConditionsObj.termsConditions) +
                "</p>" +
                "<p class=\"has-text-right\">" +
                (termsConditionsObj.termsConditionsCount > 1
                  ? "<span class=\"tag is-light has-tooltip-left\" data-tooltip=\"Included on Multiple Licences\">" +
                  "<span class=\"icon\"><i class=\"fas fa-star\" aria-hidden=\"true\"></i></span>" +
                  " <span>Used " + termsConditionsObj.termsConditionsCount.toString() + " times</span>" +
                  "</span>"
                  : "") +
                (termsConditionsObj.isIssued >= 1
                  ? "<span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Included on an Issued Licence\">" +
                  "<span class=\"icon\"><i class=\"fas fa-stamp\" aria-hidden=\"true\"></i></span>" +
                  " <span>Issued</span>" +
                  "</span>"
                  : "") +
                " <span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Most Recent Licence Start Date\">" +
                "<span class=\"icon\"><i class=\"fas fa-calendar\" aria-hidden=\"true\"></i></span>" +
                " <span>" + termsConditionsObj.startDateMaxString + "</span>" +
                "</span>" +
                "</p>";

              listItemEle.addEventListener("click", termsConditionsLookupFn_setTermsConditions);
              listEle.insertAdjacentElement("beforeend", listItemEle);

            });

            cityssm.clearElement(termsConditionsLookupResultsEle);

            termsConditionsLookupResultsEle.insertAdjacentElement("beforeend", listEle);
          }
        }
      );

      cityssm.showModal(termsConditionsLookupModalEle);
    });

    const cancelButtonEles = termsConditionsLookupModalEle.getElementsByClassName("is-close-modal-button");

    for (const cancelButtonEle of cancelButtonEles) {
      cancelButtonEle.addEventListener("click", cityssm.hideModal);
    }
  }


  /*
   * LICENCE TYPE
   */

  const licenceType_selectEle = document.getElementById("licence--licenceTypeKey") as HTMLSelectElement;

  if (isCreate) {

    const licenceType_fieldContainerEles = document.getElementsByClassName("container-licenceTypeFields");

    const changeFn_licenceType = () => {

      const optionEle = licenceType_selectEle.selectedOptions[0];

      // Total prize value

      const totalPrizeValueMax = optionEle.getAttribute("data-total-prize-value-max");

      document.getElementById("licence--totalPrizeValue").setAttribute("max", totalPrizeValueMax);

      // Ticket types

      const hasTicketTypes = optionEle.getAttribute("data-has-ticket-types") === "true";

      const totalPrizeValueEle = document.getElementById("licence--totalPrizeValue");

      if (hasTicketTypes) {

        document.getElementById("is-ticket-types-panel").classList.remove("is-hidden");

        totalPrizeValueEle.setAttribute("readonly", "readonly");
        totalPrizeValueEle.classList.add("is-readonly");

      } else {

        const ticketTypesPanelEle = document.getElementById("is-ticket-types-panel");

        ticketTypesPanelEle.classList.add("is-hidden");
        cityssm.clearElement(ticketTypesPanelEle.getElementsByTagName("tbody")[0]);
        cityssm.clearElement(ticketTypesPanelEle.getElementsByTagName("tfoot")[0]);

        totalPrizeValueEle.removeAttribute("readonly");
        totalPrizeValueEle.classList.remove("is-readonly");
      }

      // Fields

      const licenceTypeKey = licenceType_selectEle.value;

      const idToShow = "container-licenceTypeFields--" + licenceTypeKey;

      for (const fieldContainerEle of licenceType_fieldContainerEles) {

        if (fieldContainerEle.id === idToShow) {

          fieldContainerEle.removeAttribute("disabled");
          fieldContainerEle.classList.remove("is-hidden");

        } else {

          fieldContainerEle.classList.add("is-hidden");
          fieldContainerEle.setAttribute("disabled", "disabled");
        }
      }
    };

    licenceType_selectEle.addEventListener("change", changeFn_licenceType);
  }


  /*
   * DATES AND EVENTS
   */

  {
    const startDateEle = document.getElementById("licence--startDateString") as HTMLInputElement;
    const endDateEle = document.getElementById("licence--endDateString") as HTMLInputElement;

    const dateFn_setMin = () => {

      const startDateString = startDateEle.value;

      endDateEle.setAttribute("min", startDateString);

      if (endDateEle.value < startDateString) {
        endDateEle.value = startDateString;
      }

      const eventDateEles = eventsContainerEle.getElementsByTagName("input");

      for (const eventDateEle of eventDateEles) {
        eventDateEle.setAttribute("min", startDateString);
      }
    };

    const dateFn_setMax = () => {

      const endDateString = endDateEle.value;

      const eventDateEles = eventsContainerEle.getElementsByTagName("input");

      for (const eventDateEle of eventDateEles) {
        eventDateEle.setAttribute("max", endDateString);
      }
    };

    document.getElementById("licence--applicationDateString").addEventListener("change", (changeEvent) => {

      startDateEle.setAttribute("min",
        (changeEvent.currentTarget as HTMLInputElement).value);

    });

    startDateEle.addEventListener("change", dateFn_setMin);
    endDateEle.addEventListener("change", dateFn_setMax);


    /*
     * EVENTS
     */


    const eventFn_remove = (clickEvent: Event) => {

      (clickEvent.currentTarget as HTMLButtonElement).closest(".panel-block").remove();

      doRefreshAfterSave = true;
      setUnsavedChangesFn();

    };

    const eventFn_add = (eventDate: Date | string | Event) => {

      let eventDateString = "";

      if (eventDate) {

        if (eventDate instanceof Date) {

          eventDateString = eventDate.getFullYear().toString() + "-" +
            ("00" + (eventDate.getMonth() + 1).toString()).slice(-2) + "-" +
            ("00" + eventDate.getDate().toString()).slice(-2);

        } else if (eventDate.constructor === String) {

          eventDateString = eventDate;

        } else if (eventDate instanceof Event) {

          try {

            eventDate.preventDefault();

            const sourceEleID = (eventDate.currentTarget as HTMLElement).getAttribute("data-source");

            eventDateString = (document.getElementById(sourceEleID) as HTMLInputElement).value;

          } catch (_e) {
            // Ignore
          }
        }
      }

      eventsContainerEle.insertAdjacentHTML(
        "beforeend",
        "<div class=\"panel-block is-block\">" +
        "<div class=\"field has-addons\">" +
        ("<div class=\"control is-expanded has-icons-left\">" +
          "<input class=\"input is-small input--eventDateString\" name=\"eventDateString\" type=\"date\"" +
          " value=\"" + cityssm.escapeHTML(eventDateString) + "\"" +
          " min=\"" + cityssm.escapeHTML(startDateEle.value) + "\"" +
          " max=\"" + cityssm.escapeHTML(endDateEle.value) + "\"" +
          " required />" +
          "<span class=\"icon is-left\">" +
          "<i class=\"fas fa-calendar\" aria-hidden=\"true\"></i>" +
          "</span>" +
          "</div>") +
        ("<div class=\"control\">" +
          "<a class=\"button is-small is-danger has-tooltip-right\" role=\"button\" data-tooltip=\"Remove Event\">" +
          "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
          "<span class=\"sr-only\">Remove Event</span>" +
          "</a>" +
          "</div>") +
        "</div>" +
        "</div>"
      );

      const buttonEles = eventsContainerEle.getElementsByTagName("a");
      buttonEles[buttonEles.length - 1].addEventListener("click", eventFn_remove);

      doRefreshAfterSave = true;
      setUnsavedChangesFn();

    };

    const eventCalculator_modalEle = document.getElementById("is-event-calculator-modal");

    document.getElementsByClassName("is-calculate-events-button")[0].addEventListener("click", () => {

      const eventCount = parseInt((document.getElementById("eventCalc--eventCount") as HTMLInputElement).value, 10);
      const dayInterval = parseInt((document.getElementById("eventCalc--dayInterval") as HTMLInputElement).value, 10);

      let dateSplit = endDateEle.value.split("-");

      const endDate = new Date(parseInt(dateSplit[0], 10), parseInt(dateSplit[1], 10) - 1, parseInt(dateSplit[2], 10));

      dateSplit = startDateEle.value.split("-");

      const eventDate =
        new Date(parseInt(dateSplit[0], 10), parseInt(dateSplit[1], 10) - 1, parseInt(dateSplit[2], 10));

      for (let eventNum = 0; eventNum < eventCount && eventDate.getTime() <= endDate.getTime(); eventNum += 1) {

        eventFn_add(eventDate);

        eventDate.setDate(eventDate.getDate() + dayInterval);

      }

      cityssm.hideModal(eventCalculator_modalEle);
    });


    document.getElementById("is-event-calculator-button").addEventListener("click", () => {

      cityssm.showModal(eventCalculator_modalEle);
    });

    const cancelButtonEles = eventCalculator_modalEle.getElementsByClassName("is-close-modal-button");

    for (const cancelButtonEle of cancelButtonEles) {
      cancelButtonEle.addEventListener("click", cityssm.hideModal);
    }

    const addEventBtnEles = document.getElementsByClassName("is-add-event-button");

    for (const addEventBtnEle of addEventBtnEles) {
      addEventBtnEle.addEventListener("click", eventFn_add);
    }
  }


  /*
   * TICKET TYPES
   */

  const ticketTypesPanelEle = document.getElementById("is-ticket-types-panel");

  if (ticketTypesPanelEle) {

    /*
     * Caches
     */

    const cache_licenceTypeKeyToTicketTypes: Map<string, configTypes.ConfigTicketType[]> = new Map();

    const cacheFn_loadTicketTypes = (callbackFn: (ticketTypes: configTypes.ConfigTicketType[]) => void) => {

      const licenceTypeKey = licenceType_selectEle.value;

      if (cache_licenceTypeKeyToTicketTypes.has(licenceTypeKey)) {

        callbackFn(cache_licenceTypeKeyToTicketTypes.get(licenceTypeKey));

      } else {

        cityssm.postJSON(urlPrefix + "/licences/doGetTicketTypes", {
          licenceTypeKey
        },
          (ticketTypes: configTypes.ConfigTicketType[]) => {

            cache_licenceTypeKeyToTicketTypes.set(licenceTypeKey, ticketTypes);
            callbackFn(ticketTypes);
          }
        );
      }
    };

    const cache_distributorLocations: recordTypes.Location[] = [];
    let cache_distributorLocations_idToName: Map<number, string>;

    const cache_manufacturerLocations: recordTypes.Location[] = [];
    let cache_manufacturerLocations_idToName: Map<number, string>;

    const cacheFn_loadDistributorLocations = (callbackFn: (locationList: recordTypes.Location[]) => void) => {

      if (cache_distributorLocations.length === 0) {

        loadLocationListFn(() => {

          cache_distributorLocations_idToName = new Map<number, string>();

          for (const location of locationList) {
            if (location.locationIsDistributor) {
              cache_distributorLocations.push(location);
              cache_distributorLocations_idToName.set(location.locationID, location.locationDisplayName);
            }
          }

          callbackFn(cache_distributorLocations);
        });

      } else {
        callbackFn(cache_distributorLocations);
      }
    };

    const cacheFn_loadManufacturerLocations = (callbackFn: (locationList: recordTypes.Location[]) => void) => {

      if (cache_manufacturerLocations.length === 0) {

        loadLocationListFn(() => {

          cache_manufacturerLocations_idToName = new Map<number, string>();

          for (const location of locationList) {
            if (location.locationIsManufacturer) {
              cache_manufacturerLocations.push(location);
              cache_manufacturerLocations_idToName.set(location.locationID, location.locationDisplayName);
            }
          }

          callbackFn(cache_manufacturerLocations);
        });

      } else {
        callbackFn(cache_manufacturerLocations);
      }
    };

    const logTableEle = document.getElementById("ticketTypesTabPanel--log");
    const logTableTbodyEle = logTableEle.getElementsByTagName("tbody")[0];
    const logTableTFootEle = logTableEle.getElementsByTagName("tfoot")[0];

    const summaryTableFn_renderTable = () => {

    };

    const logTableFn_calculateFoot = () => {

    };

    const logTableFn_addTr = (obj: {
      ticketType: string;
      unitCount: number;
      licenceFee: number;
      prizesPerDeal: number;
      valuePerDeal: number;
      distributorLocationID: number;
      manufacturerLocationID: number;
    }) => {

      const ticketType = obj.ticketType;

      const trEle = document.createElement("tr");

      trEle.className = "has-background-success-light";

      trEle.setAttribute("data-ticket-type-index", "");
      trEle.setAttribute("data-ticket-type", ticketType);
      trEle.setAttribute("data-unit-count", obj.unitCount.toString());
      trEle.setAttribute("data-licence-fee", obj.licenceFee.toString());
      trEle.setAttribute("data-prizes-per-deal", obj.prizesPerDeal.toString());

      trEle.insertAdjacentHTML("beforeend", "<td>" +
        "<input name=\"ticketType_ticketTypeIndex\" type=\"hidden\" value=\"\" />" +
        "<input name=\"ticketType_amendmentDate\" type=\"hidden\" value=\"\" />" +
        "<span>(New Record)</span>" +
        "</td>");

      trEle.insertAdjacentHTML("beforeend", "<td>" +
        "<input name=\"ticketType_ticketType\" type=\"hidden\" value=\"" + cityssm.escapeHTML(ticketType) + "\" />" +
        "<span>" + cityssm.escapeHTML(ticketType) + "</span>" +
        "</td>");

      // Unit count

      const unitCount = obj.unitCount;

      trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
        "<input name=\"ticketType_unitCount\" type=\"hidden\" value=\"" + unitCount.toString() + "\" />" +
        "<span>" + unitCount.toString() + "</span>" +
        "</td>");

      // Value per deal

      const valuePerDeal = obj.valuePerDeal;
      const totalValuePerDeal = (valuePerDeal * unitCount).toFixed(2);

      trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
        "<input class=\"is-total-value-per-deal\" type=\"hidden\" value=\"" + totalValuePerDeal.toString() + "\" />" +
        "<span data-tooltip=\"$" + valuePerDeal.toFixed(2) + " value per deal\">$ " + totalValuePerDeal + "</span>" +
        "</td>");

      // Prizes per deal

      const prizesPerDeal = obj.prizesPerDeal;
      const totalPrizesPerDeal = (prizesPerDeal * unitCount).toFixed(2);

      trEle.insertAdjacentHTML("beforeend",
        "<td class=\"has-text-right is-nowrap\">" +
        "<input class=\"is-total-prizes-per-deal\" type=\"hidden\" value=\"" + totalPrizesPerDeal.toString() + "\" />" +
        "<span data-tooltip=\"$" + prizesPerDeal.toFixed(2) + " prizes per deal\">" +
        "$" + totalPrizesPerDeal +
        "</span>" +
        "</td>");

      // Licence fee

      const licenceFee = obj.licenceFee;

      trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
        "<input class=\"is-licence-fee\" name=\"ticketType_licenceFee\"" +
        " type=\"hidden\" value=\"" + licenceFee.toString() + "\" />" +
        "<span>$" + licenceFee.toFixed(2) + "</span>" +
        "</td>");

      // Manufacturer / Distributor

      const manufacturerLocationDisplayName = cache_manufacturerLocations_idToName.get(obj.manufacturerLocationID);
      const distributorLocationDisplayName = cache_distributorLocations_idToName.get(obj.distributorLocationID);

      trEle.insertAdjacentHTML("beforeend", "<td class=\"is-size-7\">" +
        "<input name=\"ticketType_manufacturerLocationID\" type=\"hidden\" value=\"" + obj.manufacturerLocationID.toString() + "\" />" +
        "<input name=\"ticketType_distributorLocationID\" type=\"hidden\" value=\"" + obj.distributorLocationID.toString() + "\" />" +
        "<span>" + cityssm.escapeHTML(manufacturerLocationDisplayName) + "<span><br />" +
        "<span>" + cityssm.escapeHTML(distributorLocationDisplayName) + "<span>" +
        "</td>");

      // Delete

      trEle.insertAdjacentHTML("beforeend", "<td class=\"is-hidden-print\">" +
        "<button class=\"button is-small is-danger has-tooltip-left is-delete-ticket-type-button\"" +
        " data-tooltip=\"Delete Ticket Type\" type=\"button\">" +
        "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
        "<span class=\"sr-only\">Delete</span>" +
        "</button>" +
        "</td>");

      trEle.getElementsByClassName("is-delete-ticket-type-button")[0]
        .addEventListener("click", deleteTicketTypeFn_openConfirm);

      // Insert row

      logTableTbodyEle.insertAdjacentElement("afterbegin", trEle);

      logTableFn_calculateFoot();
      summaryTableFn_renderTable();

      setUnsavedChangesFn();
      setDoRefreshAfterSaveFn();
    };


    const tabEles = ticketTypesPanelEle.querySelectorAll(".panel-tabs a");

    const tabsFn_selectTab = (clickEvent: MouseEvent) => {
      clickEvent.preventDefault();

      tabEles.forEach((tabEle) => {
        tabEle.classList.remove("is-active");
      });

      const selectedTabEle = clickEvent.currentTarget as HTMLAnchorElement;
      selectedTabEle.classList.add("is-active");

      document.getElementById("ticketTypesTabPanel--summary").classList.add("is-hidden");
      document.getElementById("ticketTypesTabPanel--log").classList.add("is-hidden");

      document.getElementById(selectedTabEle.getAttribute("aria-controls")).classList.remove("is-hidden");
    };

    tabEles.forEach((tabEle) => {
      tabEle.addEventListener("click", tabsFn_selectTab);
    });

    const ticketTypesFn_calculateTfoot = () => {

      let prizeValueTotal = 0;

      const prizeValueEles =
        ticketTypesPanelEle.getElementsByClassName("is-total-prizes-per-deal") as HTMLCollectionOf<HTMLInputElement>;

      for (const prizeValueEle of prizeValueEles) {
        prizeValueTotal += parseFloat(prizeValueEle.value);
      }

      let licenceFeeTotal = 0;

      const licenceFeeEles =
        ticketTypesPanelEle.getElementsByClassName("is-licence-fee") as HTMLCollectionOf<HTMLInputElement>;

      for (const licenceFeeEle of licenceFeeEles) {
        licenceFeeTotal += parseFloat(licenceFeeEle.value);
      }

      ticketTypesPanelEle.getElementsByTagName("tfoot")[0].innerHTML = "<tr>" +
        "<td></td>" +
        "<td></td>" +
        "<td></td>" +
        "<th class=\"has-text-right is-nowrap\">$ " + prizeValueTotal.toFixed(2) + "</th>" +
        "<th class=\"has-text-right is-nowrap\">$ " + licenceFeeTotal.toFixed(2) + "</th>" +
        "</tr>";

      (document.getElementById("licence--totalPrizeValue") as HTMLInputElement).value = prizeValueTotal.toFixed(2);

    };

    const deleteTicketTypeFn_openConfirm = (buttonEvent: Event) => {

      const trEle = (buttonEvent.currentTarget as HTMLButtonElement).closest("tr");
      const eventDateString = trEle.getAttribute("data-event-date-string");
      const ticketType = trEle.getAttribute("data-ticket-type");

      const ticketTypeKey = eventDateString + ":" + ticketType;

      const doDeleteTicketTypeFn = () => {

        trEle.remove();

        if (!isCreate) {

          const addEle = formEle.querySelector("input[name='ticketTypeKey_toAdd'][value='" + ticketTypeKey + "']");

          if (addEle) {

            addEle.remove();

          } else {

            formEle.insertAdjacentHTML(
              "beforeend",
              "<input class=\"is-removed-after-save\" name=\"ticketTypeKey_toDelete\"" +
              " type=\"hidden\" value=\"" + cityssm.escapeHTML(ticketTypeKey) + "\" />"
            );
          }
        }

        ticketTypesFn_calculateTfoot();

        setUnsavedChangesFn();
        setDoRefreshAfterSaveFn();
      };

      cityssm.confirmModal(
        "Delete Ticket Type?",
        "Are you sure you want to remove the " + ticketType + " ticket type for this licence?",
        "Yes, Delete",
        "danger",
        doDeleteTicketTypeFn
      );
    };

    const addTicketType_openModal = () => {

      let addTicketType_closeModalFn: () => void;
      let addTicketType_ticketTypeEle: HTMLSelectElement;
      let addTicketType_unitCountEle: HTMLInputElement;

      const addTicketTypeFn_addTicketType = (formEvent: Event) => {

        formEvent.preventDefault();

        logTableFn_addTr({
          ticketType: (document.getElementById("ticketTypeAdd--ticketType") as HTMLInputElement).value,
          unitCount: parseInt((document.getElementById("ticketTypeAdd--unitCount") as HTMLInputElement).value, 10),
          valuePerDeal: parseFloat((document.getElementById("ticketTypeAdd--valuePerDeal") as HTMLInputElement).value),
          prizesPerDeal: parseFloat((document.getElementById("ticketTypeAdd--prizesPerDeal") as HTMLInputElement).value),
          licenceFee: parseFloat((document.getElementById("ticketTypeAdd--licenceFee") as HTMLInputElement).value),
          distributorLocationID: parseInt((document.getElementById("ticketTypeAdd--distributorLocationID") as HTMLSelectElement).value, 10),
          manufacturerLocationID: parseInt((document.getElementById("ticketTypeAdd--manufacturerLocationID") as HTMLSelectElement).value, 10)
        });

        addTicketType_closeModalFn();
      };

      const addTicketTypeFn_refreshUnitCountChange = () => {

        const unitCount = parseInt(addTicketType_unitCountEle.value, 10);

        (document.getElementById("ticketTypeAdd--prizesTotal") as HTMLInputElement).value =
          (parseFloat((document.getElementById("ticketTypeAdd--prizesPerDeal") as HTMLInputElement).value) * unitCount)
            .toFixed(2);

        (document.getElementById("ticketTypeAdd--licenceFee") as HTMLInputElement).value =
          (parseFloat((document.getElementById("ticketTypeAdd--feePerUnit") as HTMLInputElement).value) * unitCount)
            .toFixed(2);
      };

      const addTicketTypeFn_refreshTicketTypeChange = () => {

        const ticketTypeOptionEle = addTicketType_ticketTypeEle.selectedOptions[0];

        (document.getElementById("ticketTypeAdd--ticketPrice") as HTMLInputElement).value =
          ticketTypeOptionEle.getAttribute("data-ticket-price");

        (document.getElementById("ticketTypeAdd--ticketCount") as HTMLInputElement).value =
          ticketTypeOptionEle.getAttribute("data-ticket-count");

        (document.getElementById("ticketTypeAdd--valuePerDeal") as HTMLInputElement).value =
          (parseFloat(ticketTypeOptionEle.getAttribute("data-ticket-price")) *
            parseInt(ticketTypeOptionEle.getAttribute("data-ticket-count"), 10))
            .toFixed(2);

        (document.getElementById("ticketTypeAdd--prizesPerDeal") as HTMLInputElement).value =
          ticketTypeOptionEle.getAttribute("data-prizes-per-deal");

        (document.getElementById("ticketTypeAdd--feePerUnit") as HTMLInputElement).value =
          ticketTypeOptionEle.getAttribute("data-fee-per-unit");

        addTicketTypeFn_refreshUnitCountChange();
      };

      const addTicketTypeFn_populateTicketTypeSelect = () => {

        cacheFn_loadTicketTypes((ticketTypes) => {

          if (!ticketTypes || ticketTypes.length === 0) {

            addTicketType_closeModalFn();
            cityssm.alertModal("No ticket types available", "", "OK", "danger");
            return;
          }

          addTicketType_ticketTypeEle.innerHTML = "";

          for (const ticketTypeObj of ticketTypes) {

            const optionEle = document.createElement("option");

            optionEle.setAttribute("data-ticket-price", ticketTypeObj.ticketPrice.toFixed(2));
            optionEle.setAttribute("data-ticket-count", ticketTypeObj.ticketCount.toString());
            optionEle.setAttribute("data-prizes-per-deal", ticketTypeObj.prizesPerDeal.toFixed(2));
            optionEle.setAttribute("data-fee-per-unit", (ticketTypeObj.feePerUnit || 0).toFixed(2));

            optionEle.value = ticketTypeObj.ticketType;

            optionEle.innerText =
              ticketTypeObj.ticketType +
              " (" + ticketTypeObj.ticketCount.toString() + " tickets," +
              " $" + ticketTypeObj.ticketPrice.toFixed(2) + " each)";

            addTicketType_ticketTypeEle.insertAdjacentElement("beforeend", optionEle);
          }

          addTicketTypeFn_refreshTicketTypeChange();
        });
      };

      const addTicketTypeFn_reduceLocations = (optionsHTML: string, location: recordTypes.Location) => {

        return optionsHTML + "<option value=\"" + location.locationID.toString() + "\">" +
          cityssm.escapeHTML(location.locationDisplayName) +
          "</option>";
      };

      const addTicketTypeFn_populateDistributorSelect = () => {

        cacheFn_loadDistributorLocations((locations) => {
          document.getElementById("ticketTypeAdd--distributorLocationID").innerHTML =
            locations.reduce(addTicketTypeFn_reduceLocations, "<option value=\"\">(No Distributor)</option>");
        });
      };

      const addTicketTypeFn_populateManufacturerSelect = () => {

        cacheFn_loadManufacturerLocations((locations) => {
          document.getElementById("ticketTypeAdd--manufacturerLocationID").innerHTML =
            locations.reduce(addTicketTypeFn_reduceLocations, "<option value=\"\">(No Manufacturer)</option>");
        });
      };

      cityssm.openHtmlModal("licence-ticketTypeAdd", {

        onshow(modalEle): void {

          addTicketType_ticketTypeEle = document.getElementById("ticketTypeAdd--ticketType") as HTMLSelectElement;
          addTicketType_unitCountEle = document.getElementById("ticketTypeAdd--unitCount") as HTMLInputElement;

          addTicketTypeFn_populateDistributorSelect();
          addTicketTypeFn_populateManufacturerSelect();
          addTicketTypeFn_populateTicketTypeSelect();

          addTicketType_ticketTypeEle.addEventListener("change", addTicketTypeFn_refreshTicketTypeChange);
          addTicketType_unitCountEle.addEventListener("change", addTicketTypeFn_refreshUnitCountChange);

          modalEle.getElementsByTagName("form")[0].addEventListener("submit", addTicketTypeFn_addTicketType);
        },

        onshown(_modalEle, closeModalFn) {
          addTicketType_closeModalFn = closeModalFn;
        }
      });
    };

    ticketTypesFn_calculateTfoot();

    document.getElementById("is-add-ticket-type-button").addEventListener("click", addTicketType_openModal);

    const deleteButtonEles = ticketTypesPanelEle.getElementsByClassName("is-delete-ticket-type-button");

    for (const deleteButtonEle of deleteButtonEles) {
      deleteButtonEle.addEventListener("click", deleteTicketTypeFn_openConfirm);
    }
  }


  /*
   * TRANSACTIONS
   */

  if (!isCreate) {

    const updateFeeButtonEle = document.getElementById("is-update-expected-licence-fee-button");

    if (updateFeeButtonEle) {

      updateFeeButtonEle.addEventListener("click", () => {

        const licenceFeeEle = document.getElementById("licence--licenceFee") as HTMLInputElement;

        licenceFeeEle.value = updateFeeButtonEle.getAttribute("data-licence-fee-expected");
        licenceFeeEle.classList.remove("is-danger");
        licenceFeeEle.closest(".field").getElementsByClassName("help")[0].remove();

        updateFeeButtonEle.remove();

        setUnsavedChangesFn();
        setDoRefreshAfterSaveFn();
      });
    }

    document.getElementById("is-add-transaction-button").addEventListener("click", () => {

      let addTransactionFormEle: HTMLFormElement;

      const addTransactionFn = (formEvent?: Event) => {

        if (formEvent) {
          formEvent.preventDefault();
        }

        cityssm.postJSON(urlPrefix + "/licences/doAddTransaction",
          addTransactionFormEle,
          (responseJSON: { success: boolean }) => {

            if (responseJSON.success) {
              window.location.reload();
            }
          }
        );
      };

      cityssm.openHtmlModal("licence-transactionAdd", {

        onshow(modalEle: HTMLElement): void {

          llm.getDefaultConfigProperty("externalReceiptNumber_fieldLabel", (fieldLabel: string) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            (modalEle.querySelector("label[for='transactionAdd--externalReceiptNumber']") as HTMLLabelElement).innerText =
              fieldLabel;
          });

          (document.getElementById("transactionAdd--licenceID") as HTMLInputElement).value = licenceID;

          const licenceFee = parseFloat((document.getElementById("licence--licenceFee") as HTMLInputElement).value);

          const transactionTotalEle = document.getElementById("licence--transactionTotal");
          const transactionTotal = parseFloat(transactionTotalEle ? transactionTotalEle.innerText : "0");

          document.getElementById("transactionAdd--licenceFee").innerText = licenceFee.toFixed(2);
          document.getElementById("transactionAdd--transactionTotal").innerText = transactionTotal.toFixed(2);

          const discrepancy = (licenceFee - transactionTotal).toFixed(2);

          document.getElementById("transactionAdd--discrepancy").innerText = discrepancy;
          (document.getElementById("transactionAdd--transactionAmount") as HTMLInputElement).value = discrepancy;

          addTransactionFormEle = modalEle.getElementsByTagName("form")[0];

          addTransactionFormEle.addEventListener("submit", addTransactionFn);

          if (!isIssued) {

            const addAndIssueButtonEle = document.getElementById("is-add-transaction-issue-licence-button");

            addAndIssueButtonEle.classList.remove("is-hidden");

            addAndIssueButtonEle.addEventListener("click", () => {

              (document.getElementById("transactionAdd--issueLicence") as HTMLInputElement).value = "true";
              addTransactionFn();
            });
          }
        }
      });
    });

    const voidTransactionButtonEle = document.getElementById("is-void-transaction-button");

    if (voidTransactionButtonEle) {

      voidTransactionButtonEle.addEventListener("click", () => {

        if (hasUnsavedChanges) {

          cityssm.alertModal(
            "Unsaved Changes",
            "Please save all unsaved changes before issuing this licence.",
            "OK",
            "warning"
          );

          return;
        }

        const voidFn = () => {

          cityssm.postJSON(urlPrefix + "/licences/doVoidTransaction", {
            licenceID,
            transactionIndex: voidTransactionButtonEle.getAttribute("data-transaction-index")
          },
            (responseJSON: { success: true }) => {

              if (responseJSON.success) {
                window.location.reload();
              }
            }
          );

        };

        const reverseTransactionAmount =
          (parseFloat(voidTransactionButtonEle.getAttribute("data-transaction-amount")) * -1).toFixed(2);

        cityssm.confirmModal(
          "Void Transaction?",
          "<strong>Are you sure you want to void this transaction?</strong><br />" +
          "If the history of this transaction should be maintained," +
          " it may be preferred to create a new transaction for $ " + reverseTransactionAmount + ".",
          "Void Transaction",
          "warning",
          voidFn
        );
      });
    }
  }


  /*
   * ISSUE / UNISSUE LICENCE
   */

  if (!isCreate) {

    const unissueLicenceButtonEle = document.getElementById("is-unissue-licence-button");

    if (unissueLicenceButtonEle) {

      unissueLicenceButtonEle.addEventListener("click", () => {

        const unissueFn = () => {

          cityssm.postJSON(urlPrefix + "/licences/doUnissueLicence", {
            licenceID
          },
            (responseJSON: { success: boolean }) => {

              if (responseJSON.success) {
                window.location.reload();
              }
            }
          );
        };

        cityssm.confirmModal(
          "Unissue Licence?",
          "Are you sure you want to unissue this lottery licence?",
          "Yes, Unissue",
          "danger",
          unissueFn
        );
      });

    } else {

      const issueLicenceFn = () => {

        const issueFn = () => {

          cityssm.postJSON(urlPrefix + "/licences/doIssueLicence", {
            licenceID
          },
            (responseJSON: { success: boolean }) => {

              if (responseJSON.success) {
                window.location.reload();
              }
            }
          );
        };

        if (hasUnsavedChanges) {

          cityssm.alertModal(
            "Unsaved Changes",
            "Please save all unsaved changes before issuing this licence.",
            "OK",
            "warning"
          );

        } else {

          cityssm.confirmModal(
            "Issue Licence?",
            "Are you sure you want to issue this lottery licence?",
            "Yes, Issue",
            "success",
            issueFn
          );
        }
      };

      document.getElementById("is-issue-licence-button").addEventListener("click", issueLicenceFn);
      document.getElementById("is-not-issued-tag").addEventListener("dblclick", issueLicenceFn);
    }
  }
})();
