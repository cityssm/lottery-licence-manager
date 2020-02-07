"use strict";

(function() {

  /*
   * FORM
   */

  const formEle = document.getElementById("form--licence");
  const formMessageEle = document.getElementById("container--form-message");
  const licenceID = document.getElementById("licence--licenceID").value;

  const isCreate = licenceID === "";
  const isIssued = formEle.getAttribute("data-licence-is-issued") === "true";

  let doRefreshAfterSave = false;
  let hasUnsavedChanges = false;

  const eventsContainerEle = document.getElementById("container--events");

  formEle.addEventListener("submit", function(formEvent) {

    formEvent.preventDefault();

    // Ensure at least one event

    const eventDateInputEles = eventsContainerEle.getElementsByTagName("input");

    if (eventDateInputEles.length === 0) {

      llm.alertModal("Event Date Error", "Please ensure there is at least one event date.", "OK", "warning");
      return;

    }

    // Ensure event dates are distinct

    formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    llm.postJSON("/licences/doSave", formEle, function(responseJSON) {

      if (responseJSON.success) {

        llm.disableNavBlocker();
        hasUnsavedChanges = false;

      }

      if (responseJSON.success && isCreate) {

        window.location.href = "/licences/" + responseJSON.licenceID + "/edit";

      } else if (responseJSON.success && doRefreshAfterSave) {

        window.location.reload(true);

      } else {

        formMessageEle.innerHTML = "";

        llm.alertModal(
          responseJSON.message, "", "OK",
          responseJSON.success ? "success" : "danger"
        );

        const removeInputEles = document.getElementsByClassName("is-removed-after-save");

        for (let index = 0; index < removeInputEles.length; index += 1) {

          removeInputEles[index].remove();

        }

      }

    });

  });

  if (!isCreate) {

    document.getElementById("is-delete-licence-button").addEventListener("click", function(clickEvent) {

      clickEvent.preventDefault();

      llm.confirmModal(
        "Delete Licence?",
        "Are you sure you want to delete this licence and all events associated with it?",
        "Yes, Delete",
        "danger",
        function() {

          llm.postJSON(
            "/licences/doDelete", {
              licenceID: licenceID
            },
            function(responseJSON) {

              if (responseJSON.success) {

                llm.disableNavBlocker();
                window.location.href = "/licences";

              }

            }
          );

        }
      );

    });

  }


  // Nav blocker

  function setDoRefreshAfterSave() {

    doRefreshAfterSave = true;

  }

  function setUnsavedChanges(changeEvent) {

    llm.enableNavBlocker();

    hasUnsavedChanges = true;

    formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";

    if (!isCreate) {

      document.getElementById("is-add-transaction-button").setAttribute("disabled", "disabled");
      document.getElementById("is-disabled-transaction-message").classList.remove("is-hidden");

    }

    if (changeEvent &&
      (changeEvent.currentTarget.type === "number" || changeEvent.currentTarget.type === "date" || changeEvent.currentTarget.type === "time")) {

      setDoRefreshAfterSave();

    }

  }

  const inputEles = formEle.querySelectorAll("input, select, textarea");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {

    if (inputEles[inputIndex].name !== "") {

      inputEles[inputIndex].addEventListener("change", setUnsavedChanges);

    }

  }


  /*
   * EXTERNAL LICENCE NUMBER
   */


  const externalLicenceNumberUnlockBtnEle = document.getElementById("is-external-licence-number-unlock-button");

  if (externalLicenceNumberUnlockBtnEle) {

    externalLicenceNumberUnlockBtnEle.addEventListener("click", function() {

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

    let organizationList = [];

    let organizationLookupCloseModalFn;
    let organizationLookupSearchStrEle;
    let organizationLookupResultsEle;

    const organizationLookupFn_setOrganization = function(clickEvent) {

      clickEvent.preventDefault();

      const organizationEle = clickEvent.currentTarget;

      document.getElementById("licence--organizationID").value = organizationEle.getAttribute("data-organization-id");
      document.getElementById("licence--organizationName").value = organizationEle.getAttribute("data-organization-name");

      organizationLookupCloseModalFn();

      setUnsavedChanges();

    };

    const organizationLookupFn_refreshResults = function() {

      const listEle = document.createElement("div");
      listEle.className = "list is-hoverable";

      const searchStringSplit = organizationLookupSearchStrEle.value
        .trim()
        .toLowerCase()
        .split(" ");

      let displayLimit = 10;

      for (let organizationIndex = 0; organizationIndex < organizationList.length && displayLimit > 0; organizationIndex += 1) {

        let doDisplayRecord = true;

        const organizationObj = organizationList[organizationIndex];

        if (!organizationObj.isEligibleForLicences) {

          continue;

        }

        const organizationName = organizationObj.organizationName.toLowerCase();

        for (let searchStringIndex = 0; searchStringIndex < searchStringSplit.length; searchStringIndex += 1) {

          if (organizationName.indexOf(searchStringSplit[searchStringIndex]) === -1) {

            doDisplayRecord = false;
            break;

          }

        }

        if (doDisplayRecord) {

          displayLimit -= 1;

          const listItemEle = document.createElement("a");
          listItemEle.className = "list-item";
          listItemEle.setAttribute("data-organization-id", organizationObj.organizationID);
          listItemEle.setAttribute("data-organization-name", organizationObj.organizationName);
          listItemEle.setAttribute("href", "#");
          listItemEle.innerText = organizationObj.organizationName;
          listItemEle.addEventListener("click", organizationLookupFn_setOrganization);
          listEle.insertAdjacentElement("beforeend", listItemEle);

        }

      }

      llm.clearElement(organizationLookupResultsEle);

      organizationLookupResultsEle.insertAdjacentElement("beforeend", listEle);

    };

    const organizationLookupFn_openModal = function() {

      llm.openHtmlModal("licence-organizationLookup", {

        onshow: function() {

          organizationLookupSearchStrEle = document.getElementById("organizationLookup--searchStr");
          organizationLookupSearchStrEle.addEventListener("keyup", organizationLookupFn_refreshResults);

          organizationLookupResultsEle = document.getElementById("container--organizationLookup");

          if (organizationList.length === 0) {

            llm.postJSON(
              "/organizations/doGetAll",
              null,
              function(organizationListRes) {

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

        onshown: function(modalEle, closeModalFn) {

          organizationLookupCloseModalFn = closeModalFn;
          organizationLookupSearchStrEle.focus();

        }

      });

    };

    document.getElementById("is-organization-lookup-button").addEventListener("click", organizationLookupFn_openModal);
    document.getElementById("licence--organizationName").addEventListener("dblclick", organizationLookupFn_openModal);

  }


  /*
   * LOCATION LOOKUP
   */

  let locationList = [];

  function loadLocationList(callbackFn) {

    if (locationList.length === 0) {

      llm.postJSON(
        "/locations/doGetLocations",
        null,
        function(locationListRes) {

          locationList = locationListRes;
          callbackFn();

        }
      );

    } else {

      callbackFn();

    }

  }

  {

    let locationLookup_closeModalFn;
    let locationLookup_searchStrEle;
    let locationLookup_resultsEle;


    const locationLookupFn_setLocation = function(locationID, locationDisplayName) {

      document.getElementById("licence--locationID").value = locationID;
      document.getElementById("licence--locationDisplayName").value = locationDisplayName;

    };

    const locationLookupFn_setLocationFromExisting = function(clickEvent) {

      clickEvent.preventDefault();

      const locationEle = clickEvent.currentTarget;

      locationLookupFn_setLocation(
        locationEle.getAttribute("data-location-id"),
        locationEle.getAttribute("data-location-display-name")
      );

      locationLookup_closeModalFn();

      setUnsavedChanges();

    };

    const locationLookupFn_refreshResults = function() {

      const listEle = document.createElement("div");
      listEle.className = "list is-hoverable";

      const searchStringSplit = locationLookup_searchStrEle.value
        .trim()
        .toLowerCase()
        .split(" ");

      let displayLimit = 10;

      for (let locationIndex = 0; locationIndex < locationList.length && displayLimit > 0; locationIndex += 1) {

        let doDisplayRecord = true;

        const locationObj = locationList[locationIndex];

        const locationName = locationObj.locationName.toLowerCase();

        for (let searchStringIndex = 0; searchStringIndex < searchStringSplit.length; searchStringIndex += 1) {

          if (locationName.indexOf(searchStringSplit[searchStringIndex]) === -1) {

            doDisplayRecord = false;
            break;

          }

        }

        if (doDisplayRecord) {

          displayLimit -= 1;

          const listItemEle = document.createElement("a");
          listItemEle.className = "list-item";
          listItemEle.setAttribute("data-location-id", locationObj.locationID);
          listItemEle.setAttribute("data-location-display-name", locationObj.locationDisplayName);
          listItemEle.setAttribute("href", "#");

          listItemEle.innerHTML = "<div class=\"columns\">" +
            "<div class=\"column is-narrow\">" +
            "<i class=\"fas fa-map-marker-alt\" aria-hidden=\"true\"></i>" +
            "</div>" +
            "<div class=\"column\">" + llm.escapeHTML(locationObj.locationDisplayName) + "</div>" +

            (locationObj.locationName === "" ?
              "" :
              "<div class=\"column\">" + llm.escapeHTML(locationObj.locationAddress1) + "</div>") +

            "</div>";

          listItemEle.addEventListener("click", locationLookupFn_setLocationFromExisting);
          listEle.insertAdjacentElement("beforeend", listItemEle);

        }

      }

      llm.clearElement(locationLookup_resultsEle);

      locationLookup_resultsEle.insertAdjacentElement("beforeend", listEle);

    };

    const locationLookupFn_openModal = function() {

      llm.openHtmlModal("licence-locationLookup", {

        onshow: function(modalEle) {

          // Existing locations

          locationLookup_searchStrEle = document.getElementById("locationLookup--searchStr");
          locationLookup_searchStrEle.addEventListener("keyup", locationLookupFn_refreshResults);

          locationLookup_resultsEle = document.getElementById("container--locationLookup");

          loadLocationList(function() {

            locationLookup_searchStrEle.removeAttribute("disabled");
            locationLookupFn_refreshResults();
            locationLookup_searchStrEle.focus();

          });

          // New location

          llm.getDefaultConfigProperty("city", function(defaultCity) {

            if (defaultCity) {

              document.getElementById("newLocation--locationCity").value = defaultCity;

            }

          });

          llm.getDefaultConfigProperty("province", function(defaultProvince) {

            if (defaultProvince) {

              document.getElementById("newLocation--locationProvince").value = defaultProvince;

            }

          });

          document.getElementById("form--newLocation").addEventListener("submit", function(formEvent) {

            formEvent.preventDefault();

            llm.postJSON(
              "/locations/doCreate",
              formEvent.currentTarget,
              function(responseJSON) {

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

        onshown: function(modalEle, closeModalFn) {

          locationLookup_closeModalFn = closeModalFn;
          locationLookup_searchStrEle.focus();

        }

      });

    };

    document.getElementById("is-location-lookup-button").addEventListener("click", locationLookupFn_openModal);
    document.getElementById("licence--locationDisplayName").addEventListener("dblclick", locationLookupFn_openModal);

  }


  /*
   * TERMS AND CONDITIONS
   */

  {

    let termsConditionsList = [];

    const termsConditionsLookupModalEle = document.getElementById("is-termsConditions-lookup-modal");
    const termsConditionsLookupResultsEle = document.getElementById("container--termsConditionsPrevious");

    const termsConditionsLookupFn_setTermsConditions = function(clickEvent) {

      clickEvent.preventDefault();

      const termsConditionsIndex = parseInt(clickEvent.currentTarget.getAttribute("data-terms-conditions-index"));

      document.getElementById("licence--termsConditions").value = termsConditionsList[termsConditionsIndex].termsConditions;

      llm.hideModal(termsConditionsLookupModalEle);

      setUnsavedChanges();

    };

    document.getElementById("is-termsConditions-lookup-button").addEventListener("click", function() {

      termsConditionsList = [];
      llm.clearElement(termsConditionsLookupResultsEle);

      const organizationID = document.getElementById("licence--organizationID").value;

      if (organizationID === "") {

        llm.alertModal(
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

      llm.postJSON(
        "/licences/doGetDistinctTermsConditions", {
          organizationID: organizationID
        },
        function(termsConditionsListRes) {

          termsConditionsList = termsConditionsListRes;

          if (termsConditionsList.length === 0) {

            termsConditionsLookupResultsEle.innerHTML = "<p class=\"has-text-centered\">" +
              "No previously used terms and conditions found for this organization." +
              "</p>";

          } else {

            const listEle = document.createElement("div");
            listEle.className = "list is-hoverable has-margin-bottom-10";

            for (let termsConditionsIndex = 0; termsConditionsIndex < termsConditionsList.length; termsConditionsIndex += 1) {

              const termsConditionsObj = termsConditionsList[termsConditionsIndex];

              const listItemEle = document.createElement("a");
              listItemEle.className = "list-item";
              listItemEle.setAttribute("data-terms-conditions-index", termsConditionsIndex);

              listItemEle.innerHTML = "<p class=\"has-newline-chars\">" +
                llm.escapeHTML(termsConditionsObj.termsConditions) +
                "</p>" +
                "<p class=\"has-text-right\">" +
                (termsConditionsObj.termsConditionsCount > 1 ?
                  "<span class=\"tag is-light\">Used " + termsConditionsObj.termsConditionsCount + " times</span>" :
                  "") +
                "<span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Most Recent Licence Start Date\">" + termsConditionsObj.startDateMaxString + "</span>" +
                "</p>";
              listItemEle.addEventListener("click", termsConditionsLookupFn_setTermsConditions);
              listEle.insertAdjacentElement("beforeend", listItemEle);

            }

            llm.clearElement(termsConditionsLookupResultsEle);

            termsConditionsLookupResultsEle.insertAdjacentElement("beforeend", listEle);

          }

        }
      );

      llm.showModal(termsConditionsLookupModalEle);

    });

    const cancelButtonEles = termsConditionsLookupModalEle.getElementsByClassName("is-close-modal-button");

    for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {

      cancelButtonEles[buttonIndex].addEventListener("click", llm.hideModal);

    }

  }


  /*
   * LICENCE TYPE
   */

  const licenceType_selectEle = document.getElementById("licence--licenceTypeKey");

  if (isCreate) {

    const licenceType_fieldContainerEles = document.getElementsByClassName("container-licenceTypeFields");

    const changeFn_licenceType = function(changeEvent) {

      // Ticket types

      const hasTicketTypes = changeEvent.currentTarget.selectedOptions[0].getAttribute("data-has-ticket-types") === "true";

      const totalPrizeValueEle = document.getElementById("licence--totalPrizeValue");

      if (hasTicketTypes) {

        document.getElementById("is-ticket-types-panel").classList.remove("is-hidden");

        totalPrizeValueEle.setAttribute("readonly", "readonly");
        totalPrizeValueEle.classList.add("is-readonly");

      } else {

        const ticketTypesPanelEle = document.getElementById("is-ticket-types-panel");

        ticketTypesPanelEle.classList.add("is-hidden");
        llm.clearElement(ticketTypesPanelEle.getElementsByTagName("tbody")[0]);
        llm.clearElement(ticketTypesPanelEle.getElementsByTagName("tfoot")[0]);

        totalPrizeValueEle.removeAttribute("readonly");
        totalPrizeValueEle.classList.remove("is-readonly");

      }

      // fields

      const licenceTypeKey = changeEvent.currentTarget.value;

      const idToShow = "container-licenceTypeFields--" + licenceTypeKey;

      for (let containerIndex = 0; containerIndex < licenceType_fieldContainerEles.length; containerIndex += 1) {

        const fieldContainerEle = licenceType_fieldContainerEles[containerIndex];

        if (fieldContainerEle.id === idToShow) {

          licenceType_fieldContainerEles[containerIndex].removeAttribute("disabled");
          licenceType_fieldContainerEles[containerIndex].classList.remove("is-hidden");

        } else {

          licenceType_fieldContainerEles[containerIndex].classList.add("is-hidden");
          licenceType_fieldContainerEles[containerIndex].setAttribute("disabled", "disabled");

        }

      }

    };

    licenceType_selectEle.addEventListener("change", changeFn_licenceType);

  }


  /*
   * DATES AND EVENTS
   */

  {

    const startDateEle = document.getElementById("licence--startDateString");
    const endDateEle = document.getElementById("licence--endDateString");

    const dateFn_setMin = function() {

      const startDateString = startDateEle.value;

      endDateEle.setAttribute("min", startDateString);

      if (endDateEle.value < startDateString) {

        endDateEle.value = startDateString;

      }

      const eventDateEles = eventsContainerEle.getElementsByTagName("input");

      for (let eleIndex = 0; eleIndex < eventDateEles.length; eleIndex += 1) {

        eventDateEles[eleIndex].setAttribute("min", startDateString);

      }

    };

    const dateFn_setMax = function() {

      const endDateString = endDateEle.value;

      const eventDateEles = eventsContainerEle.getElementsByTagName("input");

      for (let eleIndex = 0; eleIndex < eventDateEles.length; eleIndex += 1) {

        eventDateEles[eleIndex].setAttribute("max", endDateString);

      }

    };

    document.getElementById("licence--applicationDateString").addEventListener("change", function(changeEvent) {

      startDateEle.setAttribute("min", changeEvent.currentTarget.value);

    });

    startDateEle.addEventListener("change", dateFn_setMin);
    endDateEle.addEventListener("change", dateFn_setMax);


    /*
     * EVENTS
     */


    const eventFn_remove = function(clickEvent) {

      clickEvent.currentTarget.closest(".panel-block").remove();

      doRefreshAfterSave = true;
      setUnsavedChanges();

    };

    const eventFn_add = function(eventDate) {

      let eventDateString = "";

      if (eventDate) {

        if (eventDate instanceof Date) {

          eventDateString = eventDate.getFullYear() + "-" +
            ("00" + (eventDate.getMonth() + 1)).slice(-2) + "-" +
            ("00" + eventDate.getDate()).slice(-2);

        } else if (eventDate.constructor === String) {

          eventDateString = eventDate;

        } else if (eventDate instanceof Object) {

          try {

            eventDate.preventDefault();

            const sourceEleID = eventDate.currentTarget.getAttribute("data-source");

            eventDateString = document.getElementById(sourceEleID).value;

          } catch (e) {
            // Ignore
          }

        }

      }

      eventsContainerEle.insertAdjacentHTML(
        "beforeend",
        "<div class=\"panel-block is-block\">" +
        "<div class=\"field has-addons\">" +
        ("<div class=\"control is-expanded has-icons-left\">" +
          "<input class=\"input is-small\" name=\"eventDate\" type=\"date\"" +
          " value=\"" + eventDateString + "\"" +
          " min=\"" + startDateEle.value + "\"" +
          " max=\"" + endDateEle.value + "\"" +
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
      setUnsavedChanges();

    };

    const eventCalculator_modalEle = document.getElementById("is-event-calculator-modal");

    document.getElementsByClassName("is-calculate-events-button")[0].addEventListener("click", function() {

      const eventCount = parseInt(document.getElementById("eventCalc--eventCount").value);
      const dayInterval = parseInt(document.getElementById("eventCalc--dayInterval").value);

      let dateSplit = endDateEle.value.split("-");

      const endDate = new Date(dateSplit[0], parseInt(dateSplit[1]) - 1, dateSplit[2]);

      dateSplit = startDateEle.value.split("-");

      let eventDate = new Date(dateSplit[0], parseInt(dateSplit[1]) - 1, dateSplit[2]);

      for (let eventNum = 0; eventNum < eventCount && eventDate.getTime() <= endDate.getTime(); eventNum += 1) {

        eventFn_add(eventDate);

        eventDate.setDate(eventDate.getDate() + dayInterval);

      }

      llm.hideModal(eventCalculator_modalEle);

    });


    document.getElementById("is-event-calculator-button").addEventListener("click", function() {

      llm.showModal(eventCalculator_modalEle);

    });

    const cancelButtonEles = eventCalculator_modalEle.getElementsByClassName("is-close-modal-button");

    for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {

      cancelButtonEles[buttonIndex].addEventListener("click", llm.hideModal);

    }

    const addEventBtnEles = document.getElementsByClassName("is-add-event-button");

    for (let btnIndex = 0; btnIndex < addEventBtnEles.length; btnIndex += 1) {

      addEventBtnEles[btnIndex].addEventListener("click", eventFn_add);

    }

  }


  /*
   * TICKET TYPES
   */

  const ticketTypesPanelEle = document.getElementById("is-ticket-types-panel");

  if (ticketTypesPanelEle) {

    let licenceTypeKeyToTicketTypes = {};

    const ticketTypes_getAll = function(callbackFn) {

      const licenceTypeKey = licenceType_selectEle.value;

      if (licenceTypeKey in licenceTypeKeyToTicketTypes) {

        callbackFn(licenceTypeKeyToTicketTypes[licenceTypeKey]);

      } else {

        llm.postJSON(
          "/licences/doGetTicketTypes", {
            licenceTypeKey: licenceTypeKey
          },
          function(ticketTypes) {

            licenceTypeKeyToTicketTypes[licenceTypeKey] = ticketTypes;
            callbackFn(ticketTypes);

          }
        );

      }

    };

    const ticketTypes_calculateTfoot = function() {

      let prizeValueTotal = 0;

      const prizeValueEles = ticketTypesPanelEle.getElementsByClassName("is-total-prizes-per-deal");

      for (let eleIndex = 0; eleIndex < prizeValueEles.length; eleIndex += 1) {

        prizeValueTotal += parseFloat(prizeValueEles[eleIndex].value);

      }

      let licenceFeeTotal = 0;

      const licenceFeeEles = ticketTypesPanelEle.getElementsByClassName("is-licence-fee");

      for (let eleIndex = 0; eleIndex < licenceFeeEles.length; eleIndex += 1) {

        licenceFeeTotal += parseFloat(licenceFeeEles[eleIndex].value);

      }

      ticketTypesPanelEle.getElementsByTagName("tfoot")[0].innerHTML = "<tr>" +
        "<td></td>" +
        "<td></td>" +
        "<td></td>" +
        "<th class=\"has-text-right is-nowrap\">$ " + prizeValueTotal.toFixed(2) + "</th>" +
        "<td class=\"is-hidden-print\"></td>" +
        "<th class=\"has-text-right is-nowrap\">$ " + licenceFeeTotal.toFixed(2) + "</th>" +
        "<td></td>" +
        "<td class=\"is-hidden-print\"></td>" +
        "<td></td>" +
        "<td class=\"is-hidden-print\"></td>" +
        "</tr>";

      document.getElementById("licence--totalPrizeValue").value = prizeValueTotal;

    };

    let ticketTypes_addTr;

    const deleteTicketType_openConfirm = function(buttonEvent) {

      const trEle = buttonEvent.currentTarget.closest("tr");
      const ticketType = trEle.getAttribute("data-ticket-type");

      const doDeleteTicketType = function() {

        trEle.remove();

        if (!isCreate) {

          const addEle = formEle.querySelector("input[name='ticketType_toAdd'][value='" + ticketType + "']");

          if (addEle) {

            addEle.remove();

          } else {

            formEle.insertAdjacentHTML(
              "beforeend",
              "<input class=\"is-removed-after-save\" name=\"ticketType_toDelete\"" +
              " type=\"hidden\" value=\"" + ticketType + "\" />"
            );

          }

        }

        ticketTypes_calculateTfoot();

        setUnsavedChanges();
        setDoRefreshAfterSave();

      };

      llm.confirmModal(
        "Delete Ticket Type?",
        "Are you sure you want to remove the " + ticketType + " ticket type for this licence?",
        "Yes, Delete",
        "danger",
        doDeleteTicketType
      );

    };

    const amendUnitCount_openModal = function(buttonEvent) {

      const trEle = buttonEvent.currentTarget.closest("tr");

      const ticketType = trEle.getAttribute("data-ticket-type");
      let ticketTypeObj;

      let amendUnitCount_closeModalFn;

      const amendUnitCount_closeAndUpdate = function(formEvent) {

        formEvent.preventDefault();

        const unitCount = document.getElementById("amendUnit_unitCount").value;

        const unitCountEle = trEle.querySelector("input[name='ticketType_unitCount']");
        unitCountEle.value = unitCount;
        unitCountEle.nextElementSibling.innerText = unitCount;

        const totalValueEle = trEle.getElementsByClassName("is-total-value-per-deal")[0];
        totalValueEle.value = (ticketTypeObj.ticketPrice * ticketTypeObj.ticketCount * unitCount).toFixed(2);
        totalValueEle.nextElementSibling.innerText = "$ " + (ticketTypeObj.ticketPrice * ticketTypeObj.ticketCount * unitCount).toFixed(2);

        const totalPrizesEle = trEle.getElementsByClassName("is-total-prizes-per-deal")[0];
        totalPrizesEle.value = (ticketTypeObj.prizesPerDeal * unitCount).toFixed(2);
        totalPrizesEle.nextElementSibling.innerText = "$ " + (ticketTypeObj.prizesPerDeal * unitCount).toFixed(2);

        const licenceFee = document.getElementById("amendUnit_licenceFee").value;

        const licenceFeeEle = trEle.querySelector("input[name='ticketType_licenceFee']");
        licenceFeeEle.value = licenceFee;
        licenceFeeEle.nextElementSibling.innerText = "$ " + licenceFee;

        amendUnitCount_closeModalFn();

        ticketTypes_calculateTfoot();
        setUnsavedChanges();
        setDoRefreshAfterSave();

      };

      const amendUnitCount_calculateLicenceFee = function() {

        document.getElementById("amendUnit_licenceFee").value =
          (ticketTypeObj.feePerUnit * document.getElementById("amendUnit_unitCount").value).toFixed(2);

      };

      llm.openHtmlModal("licence-ticketTypeUnitAmend", {
        onshow: function(modalEle) {

          document.getElementById("amendUnit_ticketType").value = ticketType;

          const unitCountCurrent = trEle.querySelector("input[name='ticketType_unitCount']").value;

          document.getElementById("amendUnit_unitCountCurrent").value = unitCountCurrent;

          const unitCountEle = document.getElementById("amendUnit_unitCount");
          unitCountEle.value = unitCountCurrent;

          ticketTypes_getAll(function(ticketTypes) {

            ticketTypeObj = ticketTypes.find(ele => ele.ticketType === ticketType);

            unitCountEle.addEventListener("change", amendUnitCount_calculateLicenceFee);
            amendUnitCount_calculateLicenceFee();

          });

          modalEle.getElementsByTagName("form")[0].addEventListener("submit", amendUnitCount_closeAndUpdate);

        },
        onshown: function(modalEle, closeModalFn) {

          amendUnitCount_closeModalFn = closeModalFn;

        }
      });

    };

    const amendDistributor_openModal = function(buttonEvent) {

      let distributorLookup_closeModalFn;

      const distributorTdEle = buttonEvent.currentTarget.closest("td").previousElementSibling;

      const distributorLookup_updateDistributor = function(locationButtonEvent) {

        distributorTdEle.getElementsByTagName("input")[0].value = locationButtonEvent.currentTarget.getAttribute("data-location-id");
        distributorTdEle.getElementsByTagName("span")[0].innerText = locationButtonEvent.currentTarget.getAttribute("data-location-display-name");

        distributorLookup_closeModalFn();

        setUnsavedChanges();

      };

      llm.openHtmlModal("licence-distributorLookup", {

        onshow: function() {

          loadLocationList(function() {

            const listEle = document.createElement("div");
            listEle.className = "list is-hoverable";

            for (let index = 0; index < locationList.length; index += 1) {

              const locationObj = locationList[index];

              if (!locationObj.locationIsDistributor) {

                continue;

              }


              const listItemEle = document.createElement("a");
              listItemEle.className = "list-item";
              listItemEle.setAttribute("data-location-id", locationObj.locationID);
              listItemEle.setAttribute("data-location-display-name", locationObj.locationDisplayName);

              listItemEle.innerHTML = "<div class=\"columns\">" +
                "<div class=\"column is-narrow\">" +
                "<i class=\"fas fa-map-marker-alt\" aria-hidden=\"true\"></i>" +
                "</div>" +
                "<div class=\"column\">" + llm.escapeHTML(locationObj.locationDisplayName) + "</div>" +

                (locationObj.locationName === "" ?
                  "" :
                  "<div class=\"column\">" + llm.escapeHTML(locationObj.locationAddress1) + "</div>") +

                "</div>";

              listItemEle.addEventListener("click", distributorLookup_updateDistributor);

              listEle.insertAdjacentElement("beforeend", listItemEle);

            }

            const lookupContainerEle = document.getElementById("container--distributorLookup");
            llm.clearElement(lookupContainerEle);
            lookupContainerEle.insertAdjacentElement("beforeend", listEle);

          });

        },
        onshown: function(modalEle, closeModalFn) {

          distributorLookup_closeModalFn = closeModalFn;

        }
      });

    };

    const amendManufacturer_openModal = function(buttonEvent) {

      let manufacturerLookup_closeModalFn;

      const manufacturerTdEle = buttonEvent.currentTarget.closest("td").previousElementSibling;

      const manufacturerLookup_updateManufacturer = function(locationButtonEvent) {

        manufacturerTdEle.getElementsByTagName("input")[0].value = locationButtonEvent.currentTarget.getAttribute("data-location-id");
        manufacturerTdEle.getElementsByTagName("span")[0].innerText = locationButtonEvent.currentTarget.getAttribute("data-location-display-name");

        manufacturerLookup_closeModalFn();

        setUnsavedChanges();

      };

      llm.openHtmlModal("licence-manufacturerLookup", {

        onshow: function() {

          loadLocationList(function() {

            const listEle = document.createElement("div");
            listEle.className = "list is-hoverable";

            for (let index = 0; index < locationList.length; index += 1) {

              const locationObj = locationList[index];

              if (!locationObj.locationIsManufacturer) {

                continue;

              }

              const listItemEle = document.createElement("a");
              listItemEle.className = "list-item";
              listItemEle.setAttribute("data-location-id", locationObj.locationID);
              listItemEle.setAttribute("data-location-display-name", locationObj.locationDisplayName);

              listItemEle.innerHTML = "<div class=\"columns\">" +
                "<div class=\"column is-narrow\">" +
                "<i class=\"fas fa-map-marker-alt\" aria-hidden=\"true\"></i>" +
                "</div>" +
                "<div class=\"column\">" + llm.escapeHTML(locationObj.locationDisplayName) + "</div>" +

                (locationObj.locationName === "" ?
                  "" :
                  "<div class=\"column\">" + llm.escapeHTML(locationObj.locationAddress1) + "</div>") +

                "</div>";

              listItemEle.addEventListener("click", manufacturerLookup_updateManufacturer);

              listEle.insertAdjacentElement("beforeend", listItemEle);

            }

            const lookupContainerEle = document.getElementById("container--manufacturerLookup");
            llm.clearElement(lookupContainerEle);
            lookupContainerEle.insertAdjacentElement("beforeend", listEle);

          });

        },
        onshown: function(modalEle, closeModalFn) {

          manufacturerLookup_closeModalFn = closeModalFn;

        }
      });

    };

    const addTicketType_openModal = function() {

      let addTicketType_closeModalFn;
      let addTicketType_ticketTypeEle;
      let addTicketType_unitCountEle;

      const addTicketType_addTicketType = function(formEvent) {

        formEvent.preventDefault();

        ticketTypes_addTr({
          ticketType: document.getElementById("ticketTypeAdd--ticketType").value,
          unitCount: document.getElementById("ticketTypeAdd--unitCount").value,
          valuePerDeal: document.getElementById("ticketTypeAdd--valuePerDeal").value,
          prizesPerDeal: document.getElementById("ticketTypeAdd--prizesPerDeal").value,
          licenceFee: document.getElementById("ticketTypeAdd--licenceFee").value
        });

        if (!isCreate) {

          formEle.insertAdjacentHTML(
            "beforeend",
            "<input class=\"is-removed-after-save\" name=\"ticketType_toAdd\"" +
            " type=\"hidden\" value=\"" + document.getElementById("ticketTypeAdd--ticketType").value + "\" />"
          );

        }

        addTicketType_closeModalFn();

      };

      const addTicketType_refreshUnitCountChange = function() {

        const unitCount = addTicketType_unitCountEle.value;

        document.getElementById("ticketTypeAdd--prizesTotal").value =
          (document.getElementById("ticketTypeAdd--prizesPerDeal").value * unitCount).toFixed(2);

        document.getElementById("ticketTypeAdd--licenceFee").value =
          (document.getElementById("ticketTypeAdd--feePerUnit").value * unitCount).toFixed(2);

      };

      const addTicketType_refreshTicketTypeChange = function() {

        const ticketTypeOptionEle = addTicketType_ticketTypeEle.selectedOptions[0];

        document.getElementById("ticketTypeAdd--ticketPrice").value = ticketTypeOptionEle.getAttribute("data-ticket-price");
        document.getElementById("ticketTypeAdd--ticketCount").value = ticketTypeOptionEle.getAttribute("data-ticket-count");

        document.getElementById("ticketTypeAdd--valuePerDeal").value =
          (ticketTypeOptionEle.getAttribute("data-ticket-price") * ticketTypeOptionEle.getAttribute("data-ticket-count")).toFixed(2);

        document.getElementById("ticketTypeAdd--prizesPerDeal").value = ticketTypeOptionEle.getAttribute("data-prizes-per-deal");

        document.getElementById("ticketTypeAdd--feePerUnit").value = ticketTypeOptionEle.getAttribute("data-fee-per-unit");

        addTicketType_refreshUnitCountChange();

      };

      const addTicketType_populateTicketTypeSelect = function(ticketTypes) {

        if (!ticketTypes || ticketTypes.length === 0) {

          addTicketType_closeModalFn();
          llm.alertModal("No ticket types available", "", "OK", "danger");
          return;

        }

        for (let ticketTypeIndex = 0; ticketTypeIndex < ticketTypes.length; ticketTypeIndex += 1) {

          const ticketTypeObj = ticketTypes[ticketTypeIndex];

          if (ticketTypesPanelEle.querySelector("tr[data-ticket-type='" + ticketTypeObj.ticketType + "']")) {

            continue;

          }

          const optionEle = document.createElement("option");

          optionEle.setAttribute("data-ticket-price", ticketTypeObj.ticketPrice.toFixed(2));
          optionEle.setAttribute("data-ticket-count", ticketTypeObj.ticketCount);
          optionEle.setAttribute("data-prizes-per-deal", ticketTypeObj.prizesPerDeal.toFixed(2));
          optionEle.setAttribute("data-fee-per-unit", (ticketTypeObj.feePerUnit || 0).toFixed(2));

          optionEle.value = ticketTypeObj.ticketType;
          optionEle.innerText = ticketTypeObj.ticketType + " (" + ticketTypeObj.ticketCount + " tickets, $" + ticketTypeObj.ticketPrice.toFixed(2) + " each)";

          addTicketType_ticketTypeEle.insertAdjacentElement("beforeend", optionEle);

        }

        addTicketType_refreshTicketTypeChange();

      };

      llm.openHtmlModal("licence-ticketTypeAdd", {

        onshow: function(modalEle) {

          addTicketType_ticketTypeEle = document.getElementById("ticketTypeAdd--ticketType");
          addTicketType_ticketTypeEle.addEventListener("change", addTicketType_refreshTicketTypeChange);

          addTicketType_unitCountEle = document.getElementById("ticketTypeAdd--unitCount");
          addTicketType_unitCountEle.addEventListener("change", addTicketType_refreshUnitCountChange);

          modalEle.getElementsByTagName("form")[0].addEventListener("submit", addTicketType_addTicketType);

        },

        onshown: function(modalEle, closeModalFn) {

          addTicketType_closeModalFn = closeModalFn;
          ticketTypes_getAll(addTicketType_populateTicketTypeSelect);

        }
      });

    };

    ticketTypes_addTr = function(obj) {

      const ticketType = obj.ticketType;

      const trEle = document.createElement("tr");
      trEle.setAttribute("data-ticket-type", ticketType);

      trEle.insertAdjacentHTML("beforeend", "<td>" +
        "<input name=\"ticketType_ticketType\" type=\"hidden\" value=\"" + ticketType + "\" />" +
        "<span>" + ticketType + "</span>" +
        "</td>");

      // Unit count

      const unitCount = obj.unitCount;

      trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
        "<input name=\"ticketType_unitCount\" type=\"hidden\" value=\"" + unitCount + "\" />" +
        "<span>" + unitCount + "</span>" +
        "</td>");

      // Value per deal

      const valuePerDeal = obj.valuePerDeal;
      const totalValuePerDeal = (valuePerDeal * unitCount).toFixed(2);

      trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
        "<span data-tooltip=\"$" + valuePerDeal + " value per deal\">$ " + totalValuePerDeal + "</span>" +
        "</td>");

      // Prizes per deal

      const prizesPerDeal = obj.prizesPerDeal;
      const totalPrizesPerDeal = (prizesPerDeal * unitCount).toFixed(2);

      trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
        "<input class=\"is-total-prizes-per-deal\" type=\"hidden\" value=\"" + totalPrizesPerDeal + "\" />" +
        "<span data-tooltip=\"$" + prizesPerDeal + " prizes per deal\">$ " + totalPrizesPerDeal + "</span>" +
        "</td>");

      // Amend / delete

      trEle.insertAdjacentHTML("beforeend", "<td class=\"is-hidden-print\">" +
        "<div class=\"field has-addons\">" +
        "<div class=\"control\">" +
        "<button class=\"button is-small is-amend-ticket-type-unit-count-button\" data-tooltip=\"Amend Units\" type=\"button\">Amend</button>" +
        "</div>" +
        "<div class=\"control\">" +
        "<button class=\"button is-small is-danger is-delete-ticket-type-button\" data-tooltip=\"Delete Ticket Type\" type=\"button\">" +
        "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
        "<span class=\"sr-only\">Delete</span>" +
        "</button>" +
        "</div>" +
        "</div>" +
        "</td>");

      trEle.getElementsByClassName("is-amend-ticket-type-unit-count-button")[0].addEventListener("click", amendUnitCount_openModal);
      trEle.getElementsByClassName("is-delete-ticket-type-button")[0].addEventListener("click", deleteTicketType_openConfirm);

      // Licence fee

      const licenceFee = obj.licenceFee;

      trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
        "<input class=\"is-licence-fee\" name=\"ticketType_licenceFee\" type=\"hidden\" value=\"" + licenceFee + "\" />" +
        "<span>$ " + licenceFee + "</span>" +
        "</td>");

      // Distributor

      trEle.insertAdjacentHTML("beforeend", "<td>" +
        "<input name=\"ticketType_distributorLocationID\" type=\"hidden\" value=\"\" />" +
        "<span><span class=\"has-text-grey\">(Not Set)</span><span>" +
        "</td>");

      trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-hidden-print\">" +
        "<button class=\"button is-small is-amend-ticket-type-distributor-button\" data-tooltip=\"Change Distributor\" type=\"button\">" +
        "<i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i>" +
        "<span class=\"sr-only\">Change Distributor</span>" +
        "</button>" +
        "</td>");

      trEle.getElementsByClassName("is-amend-ticket-type-distributor-button")[0].addEventListener("click", amendDistributor_openModal);

      // Manufacturer

      trEle.insertAdjacentHTML("beforeend", "<td>" +
        "<input name=\"ticketType_manufacturerLocationID\" type=\"hidden\" value=\"\" />" +
        "<span><span class=\"has-text-grey\">(Not Set)</span><span>" +
        "</td>");

      trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-hidden-print\">" +
        "<button class=\"button is-small is-amend-ticket-type-manufacturer-button\" data-tooltip=\"Change Manufacturer\" type=\"button\">" +
        "<i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i>" +
        "<span class=\"sr-only\">Change Manufacturer</span>" +
        "</button>" +
        "</td>");

      trEle.getElementsByClassName("is-amend-ticket-type-manufacturer-button")[0].addEventListener("click", amendManufacturer_openModal);

      // Insert row

      ticketTypesPanelEle.getElementsByTagName("tbody")[0].insertAdjacentElement("afterbegin", trEle);

      ticketTypes_calculateTfoot();

      setUnsavedChanges();
      setDoRefreshAfterSave();

    };

    {

      ticketTypes_calculateTfoot();

      document.getElementById("is-add-ticket-type-button").addEventListener("click", addTicketType_openModal);

      const amendUnitButtonEles = ticketTypesPanelEle.getElementsByClassName("is-amend-ticket-type-unit-count-button");

      for (let buttonIndex = 0; buttonIndex < amendUnitButtonEles.length; buttonIndex += 1) {

        amendUnitButtonEles[buttonIndex].addEventListener("click", amendUnitCount_openModal);

      }

      const deleteButtonEles = ticketTypesPanelEle.getElementsByClassName("is-delete-ticket-type-button");

      for (let buttonIndex = 0; buttonIndex < deleteButtonEles.length; buttonIndex += 1) {

        deleteButtonEles[buttonIndex].addEventListener("click", deleteTicketType_openConfirm);

      }

      const amendDistributorButtonEles = ticketTypesPanelEle.getElementsByClassName("is-amend-ticket-type-distributor-button");

      for (let buttonIndex = 0; buttonIndex < amendDistributorButtonEles.length; buttonIndex += 1) {

        amendDistributorButtonEles[buttonIndex].addEventListener("click", amendDistributor_openModal);

      }

      const amendManufacturerButtonEles = ticketTypesPanelEle.getElementsByClassName("is-amend-ticket-type-manufacturer-button");

      for (let buttonIndex = 0; buttonIndex < amendManufacturerButtonEles.length; buttonIndex += 1) {

        amendManufacturerButtonEles[buttonIndex].addEventListener("click", amendManufacturer_openModal);

      }

    }

  }


  /*
   * TRANSACTIONS
   */

  if (!isCreate) {

    const updateFeeButtonEle = document.getElementById("is-update-expected-licence-fee-button");

    if (updateFeeButtonEle) {

      updateFeeButtonEle.addEventListener("click", function() {

        const licenceFeeEle = document.getElementById("licence--licenceFee");

        licenceFeeEle.value = updateFeeButtonEle.getAttribute("data-licence-fee-expected");
        licenceFeeEle.classList.remove("is-danger");
        licenceFeeEle.closest(".field").getElementsByClassName("help")[0].remove();

        updateFeeButtonEle.remove();

        setUnsavedChanges();
        setDoRefreshAfterSave();

      });

    }

    document.getElementById("is-add-transaction-button").addEventListener("click", function() {

      let addTransactionFormEle;

      const addTransactionFn = function(formEvent) {

        if (formEvent) {

          formEvent.preventDefault();

        }

        llm.postJSON(
          "/licences/doAddTransaction",
          addTransactionFormEle,
          function(responseJSON) {

            if (responseJSON.success) {

              window.location.reload(true);

            }

          }
        );

      };

      llm.openHtmlModal("licence-transactionAdd", {

        onshow: function(modalEle) {

          llm.getDefaultConfigProperty("externalReceiptNumber_fieldLabel", function(fieldLabel) {

            modalEle.querySelector("label[for='transactionAdd--externalReceiptNumber']").innerText = fieldLabel;

          });

          document.getElementById("transactionAdd--licenceID").value = licenceID;

          const licenceFee = document.getElementById("licence--licenceFee").value;

          const transactionTotalEle = document.getElementById("licence--transactionTotal");
          const transactionTotal = (transactionTotalEle ? transactionTotalEle.innerText : 0);

          document.getElementById("transactionAdd--licenceFee").innerText = licenceFee;
          document.getElementById("transactionAdd--transactionTotal").innerText = transactionTotal;

          const discrepancy = (licenceFee - transactionTotal).toFixed(2);

          document.getElementById("transactionAdd--discrepancy").innerText = discrepancy;
          document.getElementById("transactionAdd--transactionAmount").value = discrepancy;

          addTransactionFormEle = modalEle.getElementsByTagName("form")[0];

          addTransactionFormEle.addEventListener("submit", addTransactionFn);

          if (!isIssued) {

            const addAndIssueButtonEle = document.getElementById("is-add-transaction-issue-licence-button");

            addAndIssueButtonEle.classList.remove("is-hidden");

            addAndIssueButtonEle.addEventListener("click", function() {

              document.getElementById("transactionAdd--issueLicence").value = "true";
              addTransactionFn();

            });

          }

        }

      });

    });

    const voidTransactionButtonEle = document.getElementById("is-void-transaction-button");

    if (voidTransactionButtonEle) {

      voidTransactionButtonEle.addEventListener("click", function() {

        if (hasUnsavedChanges) {

          llm.alertModal(
            "Unsaved Changes",
            "Please save all unsaved changes before issuing this licence.",
            "OK",
            "warning"
          );

          return;

        }

        const voidFn = function() {

          llm.postJSON(
            "/licences/doVoidTransaction", {
              licenceID: licenceID,
              transactionIndex: voidTransactionButtonEle.getAttribute("data-transaction-index")
            },
            function(responseJSON) {

              if (responseJSON.success) {

                window.location.reload(true);

              }

            }
          );

        };

        const reverseTransactionAmount =
          (voidTransactionButtonEle.getAttribute("data-transaction-amount") * -1).toFixed(2);

        llm.confirmModal(
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

      unissueLicenceButtonEle.addEventListener("click", function() {

        const unissueFn = function() {

          llm.postJSON(
            "/licences/doUnissueLicence", {
              licenceID: licenceID
            },
            function(responseJSON) {

              if (responseJSON.success) {

                window.location.reload(true);

              }

            }
          );

        };

        llm.confirmModal(
          "Unissue Licence?",
          "Are you sure you want to unissue this lottery licence?",
          "Yes, Unissue",
          "danger",
          unissueFn
        );

      });

    } else {

      document.getElementById("is-issue-licence-button").addEventListener("click", function() {

        const issueFn = function() {

          llm.postJSON(
            "/licences/doIssueLicence", {
              licenceID: licenceID
            },
            function(responseJSON) {

              if (responseJSON.success) {

                window.location.reload(true);

              }

            }
          );

        };

        if (hasUnsavedChanges) {

          llm.alertModal(
            "Unsaved Changes",
            "Please save all unsaved changes before issuing this licence.",
            "OK",
            "warning"
          );

        } else {

          llm.confirmModal(
            "Issue Licence?",
            "Are you sure you want to issue this lottery licence?",
            "Yes, Issue",
            "success",
            issueFn
          );

        }

      });

    }

  }

}());
