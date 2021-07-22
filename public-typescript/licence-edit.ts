/* eslint-disable unicorn/filename-case, unicorn/prefer-module */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";

import type * as recordTypes from "../types/recordTypes";
import type * as configTypes from "../types/configTypes";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


(() => {

  const urlPrefix = document.querySelector("main").getAttribute("data-url-prefix");

  /*
   * FORM
   */

  const formElement = document.querySelector("#form--licence") as HTMLFormElement;
  const formMessageElement = document.querySelector("#container--form-message");
  const licenceID = (document.querySelector("#licence--licenceID") as HTMLInputElement).value;

  const isCreate = licenceID === "";
  const isIssued = formElement.getAttribute("data-licence-is-issued") === "true";

  const refreshInputTypes = new Set(["number", "date", "time"]);

  let doRefreshAfterSave = false;
  let hasUnsavedChanges = false;

  const eventsContainerElement = document.querySelector("#container--events");

  formElement.addEventListener("submit", (formEvent) => {

    formEvent.preventDefault();

    // Ensure at least one event

    const eventDateInputElements = eventsContainerElement.querySelectorAll("input");

    if (eventDateInputElements.length === 0) {

      cityssm.alertModal("Event Date Error", "Please ensure there is at least one event date.", "OK", "warning");
      return;

    }

    // Ensure event dates are distinct

    formMessageElement.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    cityssm.postJSON(urlPrefix + "/licences/doSave",
      formElement,
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

          formMessageElement.innerHTML = "";

          cityssm.alertModal(
            responseJSON.message, "", "OK",
            responseJSON.success ? "success" : "danger"
          );

          const removeInputElements = document.querySelectorAll(".is-removed-after-save");

          for (const removeInputElement of removeInputElements) {
            removeInputElement.remove();
          }
        }
      });
  });

  if (!isCreate) {

    document.querySelector("#is-delete-licence-button").addEventListener("click", (clickEvent) => {

      clickEvent.preventDefault();

      const deleteFunction = () => {
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
        deleteFunction
      );
    });
  }


  // Nav blocker

  const setDoRefreshAfterSaveFunction = () => {
    doRefreshAfterSave = true;
  };

  const setUnsavedChangesFunction = (changeEvent?: Event) => {

    cityssm.enableNavBlocker();

    hasUnsavedChanges = true;

    formMessageElement.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";

    if (!isCreate) {
      document.querySelector("#is-add-transaction-button").setAttribute("disabled", "disabled");
      document.querySelector("#is-disabled-transaction-message").classList.remove("is-hidden");
    }

    if (changeEvent) {

      const currentTargetType =
        (changeEvent.currentTarget instanceof HTMLInputElement ? changeEvent.currentTarget.type : "");

      if (refreshInputTypes.has(currentTargetType)) {
        setDoRefreshAfterSaveFunction();
      }
    }

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
   * EXTERNAL LICENCE NUMBER
   */


  const externalLicenceNumberUnlockButtonElement = document.querySelector("#is-external-licence-number-unlock-button");

  if (externalLicenceNumberUnlockButtonElement) {

    externalLicenceNumberUnlockButtonElement.addEventListener("click", () => {

      const externalLicenceNumberElement = document.querySelector("#licence--externalLicenceNumber") as HTMLInputElement;
      externalLicenceNumberElement.classList.remove("is-readonly");
      externalLicenceNumberElement.removeAttribute("readonly");
      externalLicenceNumberElement.focus();
    });
  }


  /*
   * ORGANIZATION LOOKUP
   */

  {
    let organizationList: recordTypes.Organization[] = [];

    let organizationLookupCloseModalFunction: () => void;
    let organizationLookupSearchStringElement: HTMLInputElement;
    let organizationLookupResultsElement: HTMLElement;

    const organizationLookupFunction_setOrganization = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const organizationElement = clickEvent.currentTarget as HTMLAnchorElement;

      (document.querySelector("#licence--organizationID") as HTMLInputElement).value =
        organizationElement.getAttribute("data-organization-id");

      (document.querySelector("#licence--organizationName") as HTMLInputElement).value =
        organizationElement.getAttribute("data-organization-name");

      organizationLookupCloseModalFunction();

      setUnsavedChangesFunction();

    };

    const organizationLookupFunction_refreshResults = () => {

      const listElement = document.createElement("div");
      listElement.className = "panel";

      const searchStringSplit = organizationLookupSearchStringElement.value
        .trim()
        .toLowerCase()
        .split(" ");

      let displayLimit = 10;

      for (const organizationObject of organizationList) {

        if (displayLimit < 0) {
          break;
        }

        let doDisplayRecord = true;

        if (!organizationObject.isEligibleForLicences) {
          continue;
        }

        const organizationName = organizationObject.organizationName.toLowerCase();

        for (const searchStringPiece of searchStringSplit) {

          if (!organizationName.includes(searchStringPiece)) {

            doDisplayRecord = false;
            break;
          }
        }

        if (doDisplayRecord) {

          displayLimit -= 1;

          const listItemElement = document.createElement("a");
          listItemElement.className = "panel-block is-block";
          listItemElement.dataset.organizationId = organizationObject.organizationID.toString();
          listItemElement.dataset.organizationName = organizationObject.organizationName;
          listItemElement.setAttribute("href", "#");
          listItemElement.innerHTML = cityssm.escapeHTML(organizationObject.organizationName) + "<br />" +
            "<span class=\"is-size-7\">" +
            "<span class=\"icon\"><i class=\"fas fa-user\" aria-hidden=\"true\"></i></span> " +
            (organizationObject.representativeName
              ? cityssm.escapeHTML(organizationObject.representativeName)
              : "<span class=\"has-text-grey\">(No Representative)</span>") +
            "</span>";
          listItemElement.addEventListener("click", organizationLookupFunction_setOrganization);

          listElement.append(listItemElement);
        }
      }

      cityssm.clearElement(organizationLookupResultsElement);

      organizationLookupResultsElement.append(listElement);
    };

    const organizationLookupFunction_openModal = () => {

      cityssm.openHtmlModal("licence-organizationLookup", {

        onshow(): void {

          organizationLookupSearchStringElement =
            document.querySelector("#organizationLookup--searchStr") as HTMLInputElement;
          organizationLookupSearchStringElement.addEventListener("keyup", organizationLookupFunction_refreshResults);

          organizationLookupResultsElement = document.querySelector("#container--organizationLookup");

          if (organizationList.length === 0) {

            cityssm.postJSON(urlPrefix + "/organizations/doGetAll",
              undefined,
              (organizationListResponse: recordTypes.Organization[]) => {

                organizationList = organizationListResponse;
                organizationLookupSearchStringElement.removeAttribute("disabled");
                organizationLookupFunction_refreshResults();

                organizationLookupSearchStringElement.focus();
              }
            );

          } else {

            organizationLookupSearchStringElement.removeAttribute("disabled");
            organizationLookupFunction_refreshResults();

            organizationLookupSearchStringElement.focus();
          }
        },

        onshown(_modalElement, closeModalFunction) {

          organizationLookupCloseModalFunction = closeModalFunction;
          organizationLookupSearchStringElement.focus();
        },

        onremoved() {
          (document.querySelector("#is-organization-lookup-button") as HTMLButtonElement).focus();
        }
      });
    };

    document.querySelector("#is-organization-lookup-button").addEventListener("click", organizationLookupFunction_openModal);
    document.querySelector("#licence--organizationName").addEventListener("dblclick", organizationLookupFunction_openModal);
  }


  /*
   * LOCATION LOOKUP
   */

  let locationList: recordTypes.Location[] = [];


  const loadLocationListFunction = (callbackFunction: () => void) => {

    if (locationList.length === 0) {

      cityssm.postJSON(urlPrefix + "/locations/doGetLocations",
        undefined,
        (locationResults: { locations: recordTypes.Location[] }) => {

          locationList = locationResults.locations;
          callbackFunction();
        }
      );

    } else {
      callbackFunction();
    }
  };


  {
    let locationLookup_closeModalFunction: () => void;
    let locationLookup_searchStringElement: HTMLInputElement;
    let locationLookup_resultsElement: HTMLElement;


    const locationLookupFunction_setLocation = (locationID: number, locationDisplayName: string) => {

      (document.querySelector("#licence--locationID") as HTMLInputElement).value = locationID.toString();
      (document.querySelector("#licence--locationDisplayName") as HTMLInputElement).value = locationDisplayName;

    };

    const locationLookupFunction_setLocationFromExisting = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const locationElement = clickEvent.currentTarget as HTMLAnchorElement;

      locationLookupFunction_setLocation(
        Number.parseInt(locationElement.getAttribute("data-location-id"), 10),
        locationElement.getAttribute("data-location-display-name")
      );

      locationLookup_closeModalFunction();

      setUnsavedChangesFunction();

    };

    const locationLookupFunction_refreshResults = () => {

      const listElement = document.createElement("div");
      listElement.className = "panel";

      const searchStringSplit = locationLookup_searchStringElement.value
        .trim()
        .toLowerCase()
        .split(" ");

      let displayLimit = 10;

      for (const locationObject of locationList) {

        if (displayLimit <= 0) {
          break;
        }

        let doDisplayRecord = true;

        const locationName = locationObject.locationName.toLowerCase();

        for (const searchStringPiece of searchStringSplit) {

          if (!locationName.includes(searchStringPiece)) {
            doDisplayRecord = false;
            break;
          }
        }

        if (doDisplayRecord) {

          displayLimit -= 1;

          const listItemElement = document.createElement("a");
          listItemElement.className = "panel-block is-block";
          listItemElement.dataset.locationId = locationObject.locationID.toString();
          listItemElement.dataset.locationDisplayName = locationObject.locationDisplayName;
          listItemElement.setAttribute("href", "#");

          listItemElement.innerHTML = "<div class=\"columns\">" +
            "<div class=\"column is-narrow\">" +
            "<i class=\"fas fa-map-marker-alt\" aria-hidden=\"true\"></i>" +
            "</div>" +
            "<div class=\"column\">" + cityssm.escapeHTML(locationObject.locationDisplayName) + "</div>" +

            (locationObject.locationName === ""
              ? ""
              : "<div class=\"column\">" + cityssm.escapeHTML(locationObject.locationAddress1) + "</div>") +

            "</div>";

          listItemElement.addEventListener("click", locationLookupFunction_setLocationFromExisting);
          listElement.append(listItemElement);
        }
      }

      cityssm.clearElement(locationLookup_resultsElement);

      locationLookup_resultsElement.append(listElement);
    };

    const locationLookupFunction_openModal = () => {

      cityssm.openHtmlModal("licence-locationLookup", {

        onshow(modalElement) {

          // Existing locations

          locationLookup_searchStringElement = document.querySelector("#locationLookup--searchStr") as HTMLInputElement;
          locationLookup_searchStringElement.addEventListener("keyup", locationLookupFunction_refreshResults);

          locationLookup_resultsElement = document.querySelector("#container--locationLookup");

          loadLocationListFunction(() => {

            locationLookup_searchStringElement.removeAttribute("disabled");
            locationLookupFunction_refreshResults();
            locationLookup_searchStringElement.focus();
          });

          // New location

          llm.getDefaultConfigProperty("city", (defaultCity: string) => {
            if (defaultCity) {
              (document.querySelector("#newLocation--locationCity") as HTMLInputElement).value = defaultCity;
            }
          });

          llm.getDefaultConfigProperty("province", (defaultProvince: string) => {
            if (defaultProvince) {
              (document.querySelector("#newLocation--locationProvince") as HTMLInputElement).value = defaultProvince;
            }
          });

          document.querySelector("#form--newLocation").addEventListener("submit", (formEvent) => {

            formEvent.preventDefault();

            cityssm.postJSON(urlPrefix + "/locations/doCreate",
              formEvent.currentTarget,
              (responseJSON: { success: boolean; locationID?: number; locationDisplayName?: string }) => {

                if (responseJSON.success) {

                  locationList = [];
                  locationLookupFunction_setLocation(responseJSON.locationID, responseJSON.locationDisplayName);
                  locationLookup_closeModalFunction();
                }
              }
            );
          });

          llm.initializeTabs(modalElement.querySelector(".tabs ul"));
        },
        onshown(_modalElement, closeModalFunction) {
          locationLookup_closeModalFunction = closeModalFunction;
          locationLookup_searchStringElement.focus();
        },
        onremoved() {
          (document.querySelector("#is-location-lookup-button") as HTMLButtonElement).focus();
        }
      });
    };

    document.querySelector("#is-location-lookup-button").addEventListener("click", locationLookupFunction_openModal);
    document.querySelector("#licence--locationDisplayName").addEventListener("dblclick", locationLookupFunction_openModal);
  }


  /*
   * END DATE
   */


  document.querySelector("#is-endDateString-year-button").addEventListener("click", () => {

    const startDateStringSplit = (document.querySelector("#licence--startDateString") as HTMLInputElement).value.split("-");

    const dateObject = new Date(Number.parseInt(startDateStringSplit[0], 10) + 1,
      Number.parseInt(startDateStringSplit[1], 10) - 1,
      Number.parseInt(startDateStringSplit[2]));

    const endDateString =
      dateObject.getFullYear().toString() + "-" +
      ("00" + (dateObject.getMonth() + 1).toString()).slice(-2) + "-" +
      ("00" + dateObject.getDate().toString()).slice(-2);

    (document.querySelector("#licence--endDateString") as HTMLInputElement).value = endDateString;

    setUnsavedChangesFunction();
    setDoRefreshAfterSaveFunction();
  });


  /*
   * TERMS AND CONDITIONS
   */

  {

    let termsConditionsList: recordTypes.TermsConditionsStat[] = [];

    const termsConditionsLookupModalElement = document.querySelector("#is-termsConditions-lookup-modal") as HTMLElement;
    const termsConditionsLookupResultsElement = document.querySelector("#container--termsConditionsPrevious") as HTMLElement;

    const termsConditionsLookupFunction_setTermsConditions = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const termsConditionsIndex =
        Number.parseInt((clickEvent.currentTarget as HTMLInputElement).getAttribute("data-terms-conditions-index"), 10);

      const termsConditionsElement = document.querySelector("#licence--termsConditions") as HTMLTextAreaElement;
      termsConditionsElement.value = termsConditionsList[termsConditionsIndex].termsConditions;

      cityssm.hideModal(termsConditionsLookupModalElement);

      termsConditionsElement.focus();

      setUnsavedChangesFunction();
    };

    document.querySelector("#is-termsConditions-lookup-button").addEventListener("click", () => {

      termsConditionsList = [];
      cityssm.clearElement(termsConditionsLookupResultsElement);

      const organizationID = (document.querySelector("#licence--organizationID") as HTMLInputElement).value;

      if (organizationID === "") {

        cityssm.alertModal(
          "No Organization Selected",
          "An organization must be selected before the previously used terms and conditions can be retrieved.",
          "OK",
          "warning"
        );

        return;
      }

      termsConditionsLookupResultsElement.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
        "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
        "Loading previously used terms and conditions..." +
        "</p>";

      cityssm.postJSON(urlPrefix + "/licences/doGetDistinctTermsConditions", {
        organizationID
      },
        (termsConditionsListResponse: recordTypes.TermsConditionsStat[]) => {

          termsConditionsList = termsConditionsListResponse;

          if (termsConditionsList.length === 0) {

            termsConditionsLookupResultsElement.innerHTML = "<p class=\"has-text-centered\">" +
              "No previously used terms and conditions found for this organization." +
              "</p>";

          } else {

            const listElement = document.createElement("div");
            listElement.className = "panel mb-3";

            for (const [termsConditionsIndex, termsConditionsObject] of termsConditionsList.entries()) {

              const listItemElement = document.createElement("a");
              listItemElement.className = "panel-block is-block";
              listItemElement.dataset.termsConditionsIndex = termsConditionsIndex.toString();

              listItemElement.innerHTML = "<p class=\"has-newline-chars\">" +
                cityssm.escapeHTML(termsConditionsObject.termsConditions) +
                "</p>" +
                "<p class=\"has-text-right\">" +
                (termsConditionsObject.termsConditionsCount > 1
                  ? "<span class=\"tag is-light has-tooltip-left\" data-tooltip=\"Included on Multiple Licences\">" +
                  "<span class=\"icon\"><i class=\"fas fa-star\" aria-hidden=\"true\"></i></span>" +
                  " <span>Used " + termsConditionsObject.termsConditionsCount.toString() + " times</span>" +
                  "</span>"
                  : "") +
                (termsConditionsObject.isIssued >= 1
                  ? "<span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Included on an Issued Licence\">" +
                  "<span class=\"icon\"><i class=\"fas fa-stamp\" aria-hidden=\"true\"></i></span>" +
                  " <span>Issued</span>" +
                  "</span>"
                  : "") +
                " <span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Most Recent Licence Start Date\">" +
                "<span class=\"icon\"><i class=\"fas fa-calendar\" aria-hidden=\"true\"></i></span>" +
                " <span>" + termsConditionsObject.startDateMaxString + "</span>" +
                "</span>" +
                "</p>";

              listItemElement.addEventListener("click", termsConditionsLookupFunction_setTermsConditions);
              listElement.append(listItemElement);
            }

            cityssm.clearElement(termsConditionsLookupResultsElement);

            termsConditionsLookupResultsElement.append(listElement);
          }
        }
      );

      cityssm.showModal(termsConditionsLookupModalElement);
    });

    const cancelButtonElements = termsConditionsLookupModalElement.querySelectorAll(".is-close-modal-button");

    for (const cancelButtonElement of cancelButtonElements) {
      cancelButtonElement.addEventListener("click", cityssm.hideModal);
    }
  }


  /*
   * LICENCE TYPE
   */

  const licenceType_selectElement = document.querySelector("#licence--licenceTypeKey") as HTMLSelectElement;

  if (isCreate) {

    const licenceType_fieldContainerElements = document.querySelectorAll(".container-licenceTypeFields");

    const changeFunction_licenceType = () => {

      const optionElement = licenceType_selectElement.selectedOptions[0];

      // Total prize value

      const totalPrizeValueMax = optionElement.dataset.totalPrizeValueMax;

      document.querySelector("#licence--totalPrizeValue").setAttribute("max", totalPrizeValueMax);

      // Ticket types

      const hasTicketTypes = optionElement.dataset.hasTicketTypes === "true";

      const totalPrizeValueElement = document.querySelector("#licence--totalPrizeValue");

      if (hasTicketTypes) {

        document.querySelector("#is-ticket-types-panel").classList.remove("is-hidden");

        totalPrizeValueElement.setAttribute("readonly", "readonly");
        totalPrizeValueElement.classList.add("is-readonly");

      } else {

        const ticketTypesPanelElement = document.querySelector("#is-ticket-types-panel");

        ticketTypesPanelElement.classList.add("is-hidden");
        cityssm.clearElement(ticketTypesPanelElement.querySelector("tbody"));
        cityssm.clearElement(ticketTypesPanelElement.querySelector("tfoot"));

        totalPrizeValueElement.removeAttribute("readonly");
        totalPrizeValueElement.classList.remove("is-readonly");
      }

      // Fields

      const licenceTypeKey = licenceType_selectElement.value;

      const idToShow = "container-licenceTypeFields--" + licenceTypeKey;

      for (const fieldContainerElement of licenceType_fieldContainerElements) {

        if (fieldContainerElement.id === idToShow) {

          fieldContainerElement.removeAttribute("disabled");
          fieldContainerElement.classList.remove("is-hidden");

        } else {

          fieldContainerElement.classList.add("is-hidden");
          fieldContainerElement.setAttribute("disabled", "disabled");
        }
      }
    };

    licenceType_selectElement.addEventListener("change", changeFunction_licenceType);
  }


  /*
   * DATES AND EVENTS
   */

  {
    const startDateElement = document.querySelector("#licence--startDateString") as HTMLInputElement;
    const endDateElement = document.querySelector("#licence--endDateString") as HTMLInputElement;

    const dateFunction_setMin = () => {

      const startDateString = startDateElement.value;

      endDateElement.setAttribute("min", startDateString);

      if (endDateElement.value < startDateString) {
        endDateElement.value = startDateString;
      }

      const eventDateElements = eventsContainerElement.querySelectorAll("input");

      for (const eventDateElement of eventDateElements) {
        eventDateElement.setAttribute("min", startDateString);
      }
    };

    const dateFunction_setMax = () => {

      const endDateString = endDateElement.value;

      const eventDateElements = eventsContainerElement.querySelectorAll("input");

      for (const eventDateElement of eventDateElements) {
        eventDateElement.setAttribute("max", endDateString);
      }
    };

    document.querySelector("#licence--applicationDateString").addEventListener("change", (changeEvent) => {

      startDateElement.setAttribute("min",
        (changeEvent.currentTarget as HTMLInputElement).value);

    });

    startDateElement.addEventListener("change", dateFunction_setMin);
    endDateElement.addEventListener("change", dateFunction_setMax);


    /*
     * EVENTS
     */


    const eventFunction_remove = (clickEvent: Event) => {

      (clickEvent.currentTarget as HTMLButtonElement).closest(".panel-block").remove();

      doRefreshAfterSave = true;
      setUnsavedChangesFunction();
    };

    const eventFunction_add = (eventDate: Date | string | Event) => {

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

            const sourceElementID = (eventDate.currentTarget as HTMLElement).dataset.source;

            eventDateString = (document.querySelector("#" + sourceElementID) as HTMLInputElement).value;

          } catch {
            // Ignore
          }
        }
      }

      eventsContainerElement.insertAdjacentHTML(
        "beforeend",
        "<div class=\"panel-block is-block\">" +
        "<div class=\"field has-addons\">" +
        ("<div class=\"control is-expanded has-icons-left\">" +
          "<input class=\"input is-small input--eventDateString\" name=\"eventDateString\" type=\"date\"" +
          " value=\"" + cityssm.escapeHTML(eventDateString) + "\"" +
          " min=\"" + cityssm.escapeHTML(startDateElement.value) + "\"" +
          " max=\"" + cityssm.escapeHTML(endDateElement.value) + "\"" +
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

      const buttonElements = eventsContainerElement.querySelectorAll("a");
      buttonElements[buttonElements.length - 1].addEventListener("click", eventFunction_remove);

      doRefreshAfterSave = true;
      setUnsavedChangesFunction();

    };

    const eventCalculator_modalElement = document.querySelector("#is-event-calculator-modal") as HTMLElement;

    document.querySelectorAll(".is-calculate-events-button")[0].addEventListener("click", () => {

      const eventCount = Number.parseInt((document.querySelector("#eventCalc--eventCount") as HTMLInputElement).value, 10);
      const dayInterval = Number.parseInt((document.querySelector("#eventCalc--dayInterval") as HTMLInputElement).value, 10);

      let dateSplit = endDateElement.value.split("-");

      const endDate = new Date(Number.parseInt(dateSplit[0], 10), Number.parseInt(dateSplit[1], 10) - 1, Number.parseInt(dateSplit[2], 10));

      dateSplit = startDateElement.value.split("-");

      const eventDate =
        new Date(Number.parseInt(dateSplit[0], 10), Number.parseInt(dateSplit[1], 10) - 1, Number.parseInt(dateSplit[2], 10));

      for (let eventNumber = 0; eventNumber < eventCount && eventDate.getTime() <= endDate.getTime(); eventNumber += 1) {

        eventFunction_add(eventDate);

        eventDate.setDate(eventDate.getDate() + dayInterval);
      }

      cityssm.hideModal(eventCalculator_modalElement);
    });


    document.querySelector("#is-event-calculator-button").addEventListener("click", () => {
      cityssm.showModal(eventCalculator_modalElement);
    });

    const cancelButtonElements = eventCalculator_modalElement.querySelectorAll(".is-close-modal-button");

    for (const cancelButtonElement of cancelButtonElements) {
      cancelButtonElement.addEventListener("click", cityssm.hideModal);
    }

    const addEventButtonElements = document.querySelectorAll(".is-add-event-button");

    for (const addEventButtonElement of addEventButtonElements) {
      addEventButtonElement.addEventListener("click", eventFunction_add);
    }
  }


  /*
   * TICKET TYPES
   */

  const ticketTypesPanelElement = document.querySelector("#is-ticket-types-panel");

  if (ticketTypesPanelElement) {

    /*
     * Caches
     */

    const cache_licenceTypeKeyToTicketTypes: Map<string, configTypes.ConfigTicketType[]> = new Map();

    const cacheFunction_loadTicketTypes = (callbackFunction: (ticketTypes: configTypes.ConfigTicketType[]) => void) => {

      const licenceTypeKey = licenceType_selectElement.value;

      if (cache_licenceTypeKeyToTicketTypes.has(licenceTypeKey)) {

        callbackFunction(cache_licenceTypeKeyToTicketTypes.get(licenceTypeKey));

      } else {

        cityssm.postJSON(urlPrefix + "/licences/doGetTicketTypes", {
          licenceTypeKey
        },
          (ticketTypes: configTypes.ConfigTicketType[]) => {

            cache_licenceTypeKeyToTicketTypes.set(licenceTypeKey, ticketTypes);
            callbackFunction(ticketTypes);
          }
        );
      }
    };

    const cache_distributorLocations: recordTypes.Location[] = [];
    let cache_distributorLocations_idToName: Map<number, string>;

    const cache_manufacturerLocations: recordTypes.Location[] = [];
    let cache_manufacturerLocations_idToName: Map<number, string>;

    const cacheFunction_loadDistributorLocations = (callbackFunction: (locationList: recordTypes.Location[]) => void) => {

      if (cache_distributorLocations.length === 0) {

        loadLocationListFunction(() => {

          cache_distributorLocations_idToName = new Map<number, string>();

          for (const location of locationList) {
            if (location.locationIsDistributor) {
              cache_distributorLocations.push(location);
              cache_distributorLocations_idToName.set(location.locationID, location.locationDisplayName);
            }
          }

          callbackFunction(cache_distributorLocations);
        });

      } else {
        callbackFunction(cache_distributorLocations);
      }
    };

    const cacheFunction_loadManufacturerLocations = (callbackFunction: (locationList: recordTypes.Location[]) => void) => {

      if (cache_manufacturerLocations.length === 0) {

        loadLocationListFunction(() => {

          cache_manufacturerLocations_idToName = new Map<number, string>();

          for (const location of locationList) {
            if (location.locationIsManufacturer) {
              cache_manufacturerLocations.push(location);
              cache_manufacturerLocations_idToName.set(location.locationID, location.locationDisplayName);
            }
          }

          callbackFunction(cache_manufacturerLocations);
        });

      } else {
        callbackFunction(cache_manufacturerLocations);
      }
    };

    /*
     * Tables
     */

    const summaryTableElement = document.querySelector("#ticketTypesTabPanel--summary");
    const summaryTableTbodyElement = summaryTableElement.querySelector("tbody");
    const summaryTableTFootElement = summaryTableElement.querySelector("tfoot");

    const logTableElement = document.querySelector("#ticketTypesTabPanel--log");
    const logTableTbodyElement = logTableElement.querySelector("tbody");
    const logTableTFootElement = logTableElement.querySelector("tfoot");

    let lastUsedDistributorID = "";
    let lastUsedManufacturerID = "";

    if (logTableTbodyElement.querySelectorAll("tr").length > 0) {

      const trElements = logTableTbodyElement.querySelectorAll("tr");
      const lastTrElement = trElements[trElements.length - 1];

      lastUsedDistributorID = lastTrElement.dataset.distributorId;
      lastUsedManufacturerID = lastTrElement.dataset.manufacturerId;
    }

    const summaryTableFunction_renderTable = () => {

      // sum up the log rows

      const ticketTypeTotals = new Map<string, {
        totalUnits: number;
        totalValue: number;
        totalPrizes: number;
        totalLicenceFee: number;
      }>();

      const logTrElements = logTableTbodyElement.querySelectorAll("tr");

      for (const logTrElement of logTrElements) {

        const ticketType = logTrElement.getAttribute("data-ticket-type");

        let totalUnits = Number.parseInt(logTrElement.getAttribute("data-unit-count"), 10);
        let totalValue = Number.parseFloat(logTrElement.getAttribute("data-total-value"));
        let totalPrizes = Number.parseFloat(logTrElement.getAttribute("data-total-prizes"));
        let totalLicenceFee = Number.parseFloat(logTrElement.getAttribute("data-licence-fee"));

        if (ticketTypeTotals.has(ticketType)) {
          totalUnits += ticketTypeTotals.get(ticketType).totalUnits;
          totalValue += ticketTypeTotals.get(ticketType).totalValue;
          totalPrizes += ticketTypeTotals.get(ticketType).totalPrizes;
          totalLicenceFee += ticketTypeTotals.get(ticketType).totalLicenceFee;
        }

        ticketTypeTotals.set(ticketType, {
          totalUnits,
          totalValue,
          totalPrizes,
          totalLicenceFee
        });
      }

      // sort ticket types

      const ticketTypes: string[] = [];

      for (const ticketType of ticketTypeTotals.keys()) {
        ticketTypes.push(ticketType);
      }

      ticketTypes.sort();

      // update summary table body

      cityssm.clearElement(summaryTableTbodyElement);

      const grandTotals = {
        totalUnits: 0,
        totalValue: 0,
        totalPrizes: 0,
        totalLicenceFee: 0
      };

      for (const ticketType of ticketTypes) {

        const rowTotals = ticketTypeTotals.get(ticketType);

        grandTotals.totalUnits += rowTotals.totalUnits;
        grandTotals.totalValue += rowTotals.totalValue;
        grandTotals.totalPrizes += rowTotals.totalPrizes;
        grandTotals.totalLicenceFee += rowTotals.totalLicenceFee;

        const summaryTrElement = document.createElement("tr");

        summaryTrElement.innerHTML = ("<td>" + ticketType + "</td>") +
          ("<td class=\"has-text-right\">" + rowTotals.totalUnits.toString() + "</td>") +
          ("<td class=\"has-text-right\">" + llm.formatDollarsAsHTML(rowTotals.totalValue) + "</td>") +
          ("<td class=\"has-text-right\">" + llm.formatDollarsAsHTML(rowTotals.totalPrizes) + "</td>") +
          ("<td class=\"has-text-right\">" + llm.formatDollarsAsHTML(rowTotals.totalLicenceFee) + "</td>");

        summaryTableTbodyElement.append(summaryTrElement);
      }

      // update summary table footer

      summaryTableTFootElement.innerHTML = "<td></td>" +
        "<th class=\"has-text-right\">" + grandTotals.totalUnits.toString() + "</th>" +
        "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalValue) + "</th>" +
        "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalPrizes) + "</th>" +
        "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalLicenceFee) + "</th>";

      // update log table footer

      logTableTFootElement.innerHTML = "<td></td>" +
        "<td></td>" +
        "<th class=\"has-text-right\">" + grandTotals.totalUnits.toString() + "</th>" +
        "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalValue) + "</th>" +
        "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalPrizes) + "</th>" +
        "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalLicenceFee) + "</th>" +
        "<td></td>" +
        "<td class=\"is-hidden-print\"></td>";

      // update total prize value

      (document.querySelector("#licence--totalPrizeValue") as HTMLInputElement).value = grandTotals.totalPrizes.toFixed(2);
    };

    const logTableFunction_addTr = (object: {
      ticketType: string;
      unitCount: number;
      licenceFee: number;
      prizesPerDeal: number;
      valuePerDeal: number;
      distributorLocationID: number;
      manufacturerLocationID: number;
    }) => {

      /*
       * Calculate values
       */

      const ticketType = object.ticketType;

      const unitCount = object.unitCount;

      const valuePerDeal = object.valuePerDeal;
      const totalValuePerDeal = (valuePerDeal * unitCount).toFixed(2);

      const prizesPerDeal = object.prizesPerDeal;
      const totalPrizesPerDeal = (prizesPerDeal * unitCount).toFixed(2);

      const licenceFee = object.licenceFee;

      /*
       * Build row
       */

      const trElement = document.createElement("tr");

      trElement.className = "has-background-success-light";

      trElement.dataset.ticketTypeIndex = "";
      trElement.dataset.ticketType = ticketType;
      trElement.dataset.unitCount = unitCount.toString();
      trElement.dataset.totalValue = totalValuePerDeal.toString();
      trElement.dataset.totalPrizes = totalPrizesPerDeal.toString();
      trElement.dataset.licenceFee = object.licenceFee.toString();

      trElement.insertAdjacentHTML("beforeend", "<td>" +
        "<input name=\"ticketType_ticketTypeIndex\" type=\"hidden\" value=\"\" />" +
        "<input name=\"ticketType_amendmentDate\" type=\"hidden\" value=\"\" />" +
        "<span>(New Record)</span>" +
        "</td>");

      trElement.insertAdjacentHTML("beforeend", "<td>" +
        "<input name=\"ticketType_ticketType\" type=\"hidden\" value=\"" + cityssm.escapeHTML(ticketType) + "\" />" +
        "<span>" + cityssm.escapeHTML(ticketType) + "</span>" +
        "</td>");

      // Unit count

      trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
        "<input name=\"ticketType_unitCount\" type=\"hidden\" value=\"" + unitCount.toString() + "\" />" +
        "<span>" + unitCount.toString() + "</span>" +
        "</td>");

      // Value per deal

      trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
        "<input class=\"is-total-value-per-deal\" type=\"hidden\" value=\"" + totalValuePerDeal.toString() + "\" />" +
        "<span data-tooltip=\"$" + valuePerDeal.toFixed(2) + " value per deal\">$ " + totalValuePerDeal + "</span>" +
        "</td>");

      // Prizes per deal

      trElement.insertAdjacentHTML("beforeend",
        "<td class=\"has-text-right is-nowrap\">" +
        "<input class=\"is-total-prizes-per-deal\" type=\"hidden\" value=\"" + totalPrizesPerDeal.toString() + "\" />" +
        "<span data-tooltip=\"$" + prizesPerDeal.toFixed(2) + " prizes per deal\">" +
        "$" + totalPrizesPerDeal +
        "</span>" +
        "</td>");

      // Licence fee

      trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
        "<input class=\"is-licence-fee\" name=\"ticketType_licenceFee\"" +
        " type=\"hidden\" value=\"" + licenceFee.toString() + "\" />" +
        "<span>$" + licenceFee.toFixed(2) + "</span>" +
        "</td>");

      // Manufacturer / Distributor

      const manufacturerLocationDisplayName = cache_manufacturerLocations_idToName.get(object.manufacturerLocationID);
      const distributorLocationDisplayName = cache_distributorLocations_idToName.get(object.distributorLocationID);

      lastUsedDistributorID = object.distributorLocationID.toString();
      lastUsedManufacturerID = object.manufacturerLocationID.toString();

      trElement.insertAdjacentHTML("beforeend", "<td class=\"is-size-7\">" +
        "<input name=\"ticketType_manufacturerLocationID\" type=\"hidden\" value=\"" + object.manufacturerLocationID.toString() + "\" />" +
        "<input name=\"ticketType_distributorLocationID\" type=\"hidden\" value=\"" + object.distributorLocationID.toString() + "\" />" +
        "<span>" + cityssm.escapeHTML(manufacturerLocationDisplayName) + "<span><br />" +
        "<span>" + cityssm.escapeHTML(distributorLocationDisplayName) + "<span>" +
        "</td>");

      // Delete

      trElement.insertAdjacentHTML("beforeend", "<td class=\"is-hidden-print\">" +
        "<button class=\"button is-small is-danger has-tooltip-left is-delete-ticket-type-button\"" +
        " data-tooltip=\"Delete Ticket Type\" type=\"button\">" +
        "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
        "<span class=\"sr-only\">Delete</span>" +
        "</button>" +
        "</td>");

      trElement.querySelector(".is-delete-ticket-type-button")
        .addEventListener("click", deleteTicketTypeFunction_openConfirm);

      // Insert row

      logTableTbodyElement.prepend(trElement);

      summaryTableFunction_renderTable();

      setUnsavedChangesFunction();
      setDoRefreshAfterSaveFunction();
    };

    const deleteTicketTypeFunction_openConfirm = (buttonEvent: Event) => {

      const trElement = (buttonEvent.currentTarget as HTMLButtonElement).closest("tr");

      const ticketType = trElement.dataset.ticketType;

      const ticketTypeIndex = trElement.dataset.ticketTypeIndex;

      const doDeleteTicketTypeFunction = () => {

        trElement.remove();

        if (!isCreate) {

          formElement.insertAdjacentHTML(
            "beforeend",
            "<input class=\"is-removed-after-save\" name=\"ticketTypeIndex_toDelete\"" +
            " type=\"hidden\" value=\"" + cityssm.escapeHTML(ticketTypeIndex) + "\" />"
          );
        }

        summaryTableFunction_renderTable();

        setUnsavedChangesFunction();
        setDoRefreshAfterSaveFunction();
      };

      cityssm.confirmModal(
        "Delete Ticket Type?",
        "Are you sure you want to remove the " + ticketType + " ticket type for this licence?",
        "Yes, Delete",
        "danger",
        doDeleteTicketTypeFunction
      );
    };

    const addTicketType_openModal = () => {

      let addTicketType_closeModalFunction: () => void;
      let addTicketType_ticketTypeElement: HTMLSelectElement;
      let addTicketType_unitCountElement: HTMLInputElement;

      const addTicketTypeFunction_addTicketType = (formEvent: Event) => {

        formEvent.preventDefault();

        logTableFunction_addTr({
          ticketType: (document.querySelector("#ticketTypeAdd--ticketType") as HTMLInputElement).value,
          unitCount: Number.parseInt((document.querySelector("#ticketTypeAdd--unitCount") as HTMLInputElement).value, 10),
          valuePerDeal: Number.parseFloat((document.querySelector("#ticketTypeAdd--valuePerDeal") as HTMLInputElement).value),
          prizesPerDeal: Number.parseFloat((document.querySelector("#ticketTypeAdd--prizesPerDeal") as HTMLInputElement).value),
          licenceFee: Number.parseFloat((document.querySelector("#ticketTypeAdd--licenceFee") as HTMLInputElement).value),
          distributorLocationID: Number.parseInt((document.querySelector("#ticketTypeAdd--distributorLocationID") as HTMLSelectElement).value, 10),
          manufacturerLocationID: Number.parseInt((document.querySelector("#ticketTypeAdd--manufacturerLocationID") as HTMLSelectElement).value, 10)
        });

        addTicketType_closeModalFunction();
      };

      const addTicketTypeFunction_refreshUnitCountChange = () => {

        const unitCount = Number.parseInt(addTicketType_unitCountElement.value, 10);

        (document.querySelector("#ticketTypeAdd--prizesTotal") as HTMLInputElement).value =
          (Number.parseFloat((document.querySelector("#ticketTypeAdd--prizesPerDeal") as HTMLInputElement).value) * unitCount)
            .toFixed(2);

        (document.querySelector("#ticketTypeAdd--licenceFee") as HTMLInputElement).value =
          (Number.parseFloat((document.querySelector("#ticketTypeAdd--feePerUnit") as HTMLInputElement).value) * unitCount)
            .toFixed(2);
      };

      const addTicketTypeFunction_refreshTicketTypeChange = () => {

        const ticketTypeOptionElement = addTicketType_ticketTypeElement.selectedOptions[0];

        (document.querySelector("#ticketTypeAdd--ticketPrice") as HTMLInputElement).value =
          ticketTypeOptionElement.getAttribute("data-ticket-price");

        (document.querySelector("#ticketTypeAdd--ticketCount") as HTMLInputElement).value =
          ticketTypeOptionElement.getAttribute("data-ticket-count");

        (document.querySelector("#ticketTypeAdd--valuePerDeal") as HTMLInputElement).value =
          (Number.parseFloat(ticketTypeOptionElement.getAttribute("data-ticket-price")) *
            Number.parseInt(ticketTypeOptionElement.getAttribute("data-ticket-count"), 10))
            .toFixed(2);

        (document.querySelector("#ticketTypeAdd--prizesPerDeal") as HTMLInputElement).value =
          ticketTypeOptionElement.getAttribute("data-prizes-per-deal");

        (document.querySelector("#ticketTypeAdd--feePerUnit") as HTMLInputElement).value =
          ticketTypeOptionElement.getAttribute("data-fee-per-unit");

        addTicketTypeFunction_refreshUnitCountChange();
      };

      const addTicketTypeFunction_populateTicketTypeSelect = () => {

        cacheFunction_loadTicketTypes((ticketTypes) => {

          if (!ticketTypes || ticketTypes.length === 0) {

            addTicketType_closeModalFunction();
            cityssm.alertModal("No ticket types available", "", "OK", "danger");
            return;
          }

          addTicketType_ticketTypeElement.innerHTML = "";

          for (const ticketTypeObject of ticketTypes) {

            const optionElement = document.createElement("option");

            optionElement.dataset.ticketPrice = ticketTypeObject.ticketPrice.toFixed(2);
            optionElement.dataset.ticketCount = ticketTypeObject.ticketCount.toString();
            optionElement.dataset.prizesPerDeal = ticketTypeObject.prizesPerDeal.toFixed(2);
            optionElement.dataset.feePerUnit = (ticketTypeObject.feePerUnit || 0).toFixed(2);

            optionElement.value = ticketTypeObject.ticketType;

            optionElement.textContent =
              ticketTypeObject.ticketType +
              " (" + ticketTypeObject.ticketCount.toString() + " tickets," +
              " $" + ticketTypeObject.ticketPrice.toFixed(2) + " each)";

            addTicketType_ticketTypeElement.append(optionElement);
          }

          addTicketTypeFunction_refreshTicketTypeChange();
        });
      };

      const addTicketTypeFunction_populateDistributorSelect = () => {

        cacheFunction_loadDistributorLocations((locations) => {

          const selectElement = document.querySelector("#ticketTypeAdd--distributorLocationID") as HTMLSelectElement;

          selectElement.innerHTML = "<option value=\"\">(No Distributor)</option>";

          for (const location of locations) {
            selectElement.insertAdjacentHTML("beforeend", "<option value=\"" + location.locationID.toString() + "\">" +
              cityssm.escapeHTML(location.locationDisplayName) +
              "</option>");
          }

          if (lastUsedDistributorID !== "" && selectElement.querySelector("[value='" + lastUsedDistributorID + "']")) {
            selectElement.value = lastUsedDistributorID;
          }
        });
      };

      const addTicketTypeFunction_populateManufacturerSelect = () => {

        cacheFunction_loadManufacturerLocations((locations) => {

          const selectElement = document.querySelector("#ticketTypeAdd--manufacturerLocationID") as HTMLSelectElement;

          selectElement.innerHTML = "<option value=\"\">(No Manufacturer)</option>";

          for (const location of locations) {
            selectElement.insertAdjacentHTML("beforeend", "<option value=\"" + location.locationID.toString() + "\">" +
              cityssm.escapeHTML(location.locationDisplayName) +
              "</option>");
          }

          if (lastUsedManufacturerID !== "" && selectElement.querySelector("[value='" + lastUsedManufacturerID + "']")) {
            selectElement.value = lastUsedManufacturerID;
          }
        });
      };

      cityssm.openHtmlModal("licence-ticketTypeAdd", {

        onshow(modalElement) {

          addTicketType_ticketTypeElement = document.querySelector("#ticketTypeAdd--ticketType") as HTMLSelectElement;
          addTicketType_unitCountElement = document.querySelector("#ticketTypeAdd--unitCount") as HTMLInputElement;

          addTicketTypeFunction_populateDistributorSelect();
          addTicketTypeFunction_populateManufacturerSelect();
          addTicketTypeFunction_populateTicketTypeSelect();

          addTicketType_ticketTypeElement.addEventListener("change", addTicketTypeFunction_refreshTicketTypeChange);
          addTicketType_unitCountElement.addEventListener("change", addTicketTypeFunction_refreshUnitCountChange);

          modalElement.querySelector("form").addEventListener("submit", addTicketTypeFunction_addTicketType);
        },

        onshown(_modalElement, closeModalFunction) {
          addTicketType_closeModalFunction = closeModalFunction;
        }
      });
    };

    summaryTableFunction_renderTable();

    document.querySelector("#is-add-ticket-type-button").addEventListener("click", addTicketType_openModal);

    const deleteButtonElements = ticketTypesPanelElement.querySelectorAll(".is-delete-ticket-type-button");

    for (const deleteButtonElement of deleteButtonElements) {
      deleteButtonElement.addEventListener("click", deleteTicketTypeFunction_openConfirm);
    }
  }


  /*
   * TRANSACTIONS
   */

  if (!isCreate) {

    const updateFeeButtonElement = document.querySelector("#is-update-expected-licence-fee-button");

    if (updateFeeButtonElement) {

      updateFeeButtonElement.addEventListener("click", () => {

        const licenceFeeElement = document.querySelector("#licence--licenceFee") as HTMLInputElement;

        licenceFeeElement.value = updateFeeButtonElement.getAttribute("data-licence-fee-expected");
        licenceFeeElement.classList.remove("is-danger");
        licenceFeeElement.closest(".field").querySelector(".help").remove();

        updateFeeButtonElement.remove();

        setUnsavedChangesFunction();
        setDoRefreshAfterSaveFunction();
      });
    }

    document.querySelector("#is-add-transaction-button").addEventListener("click", () => {

      let addTransactionFormElement: HTMLFormElement;

      const addTransactionFunction = (formEvent?: Event) => {

        if (formEvent) {
          formEvent.preventDefault();
        }

        cityssm.postJSON(urlPrefix + "/licences/doAddTransaction",
          addTransactionFormElement,
          (responseJSON: { success: boolean }) => {

            if (responseJSON.success) {
              window.location.reload();
            }
          }
        );
      };

      cityssm.openHtmlModal("licence-transactionAdd", {

        onshow(modalElement) {

          llm.getDefaultConfigProperty("externalReceiptNumber_fieldLabel", (fieldLabel: string) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            (modalElement.querySelector("label[for='transactionAdd--externalReceiptNumber']") as HTMLLabelElement).textContent =
              fieldLabel;
          });

          (document.querySelector("#transactionAdd--licenceID") as HTMLInputElement).value = licenceID;

          const licenceFee = Number.parseFloat((document.querySelector("#licence--licenceFee") as HTMLInputElement).value);

          const transactionTotalElement = document.querySelector("#licence--transactionTotal");
          const transactionTotal = Number.parseFloat(transactionTotalElement ? transactionTotalElement.textContent : "0");

          document.querySelector("#transactionAdd--licenceFee").textContent = licenceFee.toFixed(2);
          document.querySelector("#transactionAdd--transactionTotal").textContent = transactionTotal.toFixed(2);

          const discrepancy = (licenceFee - transactionTotal).toFixed(2);

          document.querySelector("#transactionAdd--discrepancy").textContent = discrepancy;
          (document.querySelector("#transactionAdd--transactionAmount") as HTMLInputElement).value = discrepancy;

          addTransactionFormElement = modalElement.querySelector("form");

          addTransactionFormElement.addEventListener("submit", addTransactionFunction);

          if (!isIssued) {

            const addAndIssueButtonElement = document.querySelector("#is-add-transaction-issue-licence-button");

            addAndIssueButtonElement.classList.remove("is-hidden");

            addAndIssueButtonElement.addEventListener("click", () => {

              (document.querySelector("#transactionAdd--issueLicence") as HTMLInputElement).value = "true";
              addTransactionFunction();
            });
          }
        }
      });
    });

    const voidTransactionButtonElement = document.querySelector("#is-void-transaction-button") as HTMLButtonElement;

    if (voidTransactionButtonElement) {

      voidTransactionButtonElement.addEventListener("click", () => {

        if (hasUnsavedChanges) {

          cityssm.alertModal(
            "Unsaved Changes",
            "Please save all unsaved changes before issuing this licence.",
            "OK",
            "warning"
          );

          return;
        }

        const voidFunction = () => {

          cityssm.postJSON(urlPrefix + "/licences/doVoidTransaction", {
            licenceID,
            transactionIndex: voidTransactionButtonElement.dataset.transactionIndex
          },
            (responseJSON: { success: true }) => {

              if (responseJSON.success) {
                window.location.reload();
              }
            }
          );
        };

        const reverseTransactionAmount =
          (Number.parseFloat(voidTransactionButtonElement.dataset.transactionAmount) * -1).toFixed(2);

        cityssm.confirmModal(
          "Void Transaction?",
          "<strong>Are you sure you want to void this transaction?</strong><br />" +
          "If the history of this transaction should be maintained," +
          " it may be preferred to create a new transaction for $ " + reverseTransactionAmount + ".",
          "Void Transaction",
          "warning",
          voidFunction
        );
      });
    }
  }


  /*
   * ISSUE / UNISSUE LICENCE
   */

  if (!isCreate) {

    const unissueLicenceButtonElement = document.querySelector("#is-unissue-licence-button");

    if (unissueLicenceButtonElement) {

      unissueLicenceButtonElement.addEventListener("click", () => {

        const unissueFunction = () => {

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
          unissueFunction
        );
      });

    } else {

      const doIssueFunction = () => {

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

      const issueLicenceFunction = () => {

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
            doIssueFunction
          );
        }
      };

      document.querySelector("#is-issue-licence-button").addEventListener("click", issueLicenceFunction);
      document.querySelector("#is-not-issued-tag").addEventListener("dblclick", issueLicenceFunction);
    }
  }
})();
