/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";


  /*
   * FORM
   */

  const formEle = document.getElementById("form--licence");
  const formMessageEle = document.getElementById("container--form-message");
  const licenceID = document.getElementById("licence--licenceID").value;
  const isCreate = licenceID === "";

  const feeFormEle = document.getElementById("form--licenceFee");

  let doRefreshAfterSave = false;

  const events_containerEle = document.getElementById("container--events");

  formEle.addEventListener("submit", function(formEvent) {
    formEvent.preventDefault();

    // ensure at least one event

    const eventDateInputEles = events_containerEle.getElementsByTagName("input");

    if (eventDateInputEles.length === 0) {
      window.llm.alertModal("Event Date Error", "Please ensure there is at least one event date.", "OK", "warning");
      return;
    }

    // ensure event dates are distinct

    formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    window.fetch("/licences/doSave", {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEle))
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(responseJSON) {

        if (responseJSON.success) {
          window.llm.disableNavBlocker();
        }

        if (responseJSON.success && isCreate) {
          window.location.href = "/licences/" + responseJSON.licenceID + "/edit";

        } else {

          if (responseJSON.success && doRefreshAfterSave) {
            window.location.reload(true);

          } else {
            formMessageEle.innerHTML = "";

            window.llm.alertModal(responseJSON.message, "", "OK",
              responseJSON.success ? "success" : "danger");
          }
        }
      });
  });

  if (!isCreate) {

    document.getElementById("is-delete-licence-button").addEventListener("click", function(clickEvent) {
      clickEvent.preventDefault();

      window.llm.confirmModal("Delete Licence?",
        "Are you sure you want to delete this licence and all events associated with it?",
        "Yes, Delete",
        "danger",
        function() {

          window.fetch("/licences/doDelete", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                licenceID: licenceID
              })
            })
            .then(function(response) {
              return response.json();
            })
            .then(function(responseJSON) {

              if (responseJSON.success) {
                window.llm.disableNavBlocker();
                window.location.href = "/licences";
              }
            });
        });
    });
  }


  // Nav blocker

  function setUnsavedChanges(changeEvent) {

    window.llm.enableNavBlocker();

    formMessageEle.innerHTML = "<div class=\"has-text-info\">" +
      "<i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i> Unsaved Changes" +
      "</div>";

    if (feeFormEle && changeEvent && changeEvent.currentTarget.type === "number") {
      feeFormEle.getElementsByTagName("fieldset")[0].setAttribute("disabled", "disabled");
      doRefreshAfterSave = true;
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

    let organizationLookup_closeModalFn;
    let organizationLookup_searchStrEle;
    let organizationLookup_resultsEle;

    const organizationLookupFn_setOrganization = function(clickEvent) {

      clickEvent.preventDefault();

      const organizationEle = clickEvent.currentTarget;

      document.getElementById("licence--organizationID").value = organizationEle.getAttribute("data-organization-id");
      document.getElementById("licence--organizationName").value = organizationEle.getAttribute("data-organization-name");

      organizationLookup_closeModalFn();

      setUnsavedChanges();
    };

    const organizationLookupFn_refreshResults = function() {

      const listEle = document.createElement("div");
      listEle.className = "list is-hoverable";

      const searchStringSplit = organizationLookup_searchStrEle.value.trim().toLowerCase().split(" ");

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
          listItemEle.innerText = organizationObj.organizationName;
          listItemEle.addEventListener("click", organizationLookupFn_setOrganization);
          listEle.insertAdjacentElement("beforeend", listItemEle);
        }
      }

      window.llm.clearElement(organizationLookup_resultsEle);

      organizationLookup_resultsEle.insertAdjacentElement("beforeend", listEle);
    };

    document.getElementById("is-organization-lookup-button").addEventListener("click", function() {

      window.llm.openHtmlModal("licence-organizationLookup", {

        onshow: function() {
          organizationLookup_searchStrEle = document.getElementById("organizationLookup--searchStr");
          organizationLookup_searchStrEle.addEventListener("keyup", organizationLookupFn_refreshResults);

          organizationLookup_resultsEle = document.getElementById("container--organizationLookup");

          if (organizationList.length === 0) {

            window.fetch("/organizations/doGetAll", {
                method: "GET",
                credentials: "include"
              })
              .then(function(response) {
                return response.json();
              })
              .then(function(organizationListRes) {
                organizationList = organizationListRes;
                organizationLookup_searchStrEle.removeAttribute("disabled");
                organizationLookupFn_refreshResults();
              });
          } else {
            organizationLookup_searchStrEle.removeAttribute("disabled");
            organizationLookupFn_refreshResults();
          }
        },

        onshown: function(modalEle, closeModalFn) {
          organizationLookup_closeModalFn = closeModalFn;
        }
      });

    });
  }


  /*
   * LOCATION LOOKUP
   */

  let locationList = [];

  function loadLocationList(callbackFn) {

    if (locationList.length === 0) {

      window.fetch("/locations/doGetLocations", {
          method: "GET",
          credentials: "include"
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(locationListRes) {
          locationList = locationListRes;
          callbackFn();
        });
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
        locationEle.getAttribute("data-location-display-name"));

      locationLookup_closeModalFn();

      setUnsavedChanges();
    };

    const locationLookupFn_refreshResults = function() {

      const listEle = document.createElement("div");
      listEle.className = "list is-hoverable";

      const searchStringSplit = locationLookup_searchStrEle.value.trim().toLowerCase().split(" ");

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

          const locationDisplayName = locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName;

          const listItemEle = document.createElement("a");
          listItemEle.className = "list-item";
          listItemEle.setAttribute("data-location-id", locationObj.locationID);
          listItemEle.setAttribute("data-location-display-name", locationDisplayName);
          listItemEle.innerHTML = locationDisplayName +
            (locationObj.locationName === "" ? "" : "<br /><small>" + locationObj.locationAddress1 + "</small>");
          listItemEle.addEventListener("click", locationLookupFn_setLocationFromExisting);
          listEle.insertAdjacentElement("beforeend", listItemEle);
        }
      }

      window.llm.clearElement(locationLookup_resultsEle);

      locationLookup_resultsEle.insertAdjacentElement("beforeend", listEle);
    };


    document.getElementById("is-location-lookup-button").addEventListener("click", function() {

      window.llm.openHtmlModal("licence-locationLookup", {

        onshow: function(modalEle) {

          // existing locations

          locationLookup_searchStrEle = document.getElementById("locationLookup--searchStr");
          locationLookup_searchStrEle.addEventListener("keyup", locationLookupFn_refreshResults);

          locationLookup_resultsEle = document.getElementById("container--locationLookup");

          loadLocationList(function() {
            locationLookup_searchStrEle.removeAttribute("disabled");
            locationLookupFn_refreshResults();
          });

          // new location

          window.llm.getDefaultConfigProperty("city", function(defaultCity) {
            if (defaultCity) {
              document.getElementById("newLocation--locationCity").value = defaultCity;
            }
          });

          window.llm.getDefaultConfigProperty("province", function(defaultProvince) {
            if (defaultProvince) {
              document.getElementById("newLocation--locationProvince").value = defaultProvince;
            }
          });

          document.getElementById("form--newLocation").addEventListener("submit", function(formEvent) {
            formEvent.preventDefault();

            window.fetch("/locations/doCreate", {
                method: "POST",
                credentials: "include",
                body: new URLSearchParams(new FormData(formEvent.currentTarget))
              })
              .then(function(response) {
                return response.json();
              })
              .then(function(responseJSON) {

                if (responseJSON.success) {
                  locationList = [];
                  locationLookupFn_setLocation(responseJSON.locationID, responseJSON.locationDisplayName);
                  locationLookup_closeModalFn();
                }
              });
          });

          window.llm.initializeTabs(modalEle.querySelector(".tabs ul"));
        },

        onshown: function(modalEle, closeModalFn) {
          locationLookup_closeModalFn = closeModalFn;
        }
      });

    });
  }


  /*
   * TERMS AND CONDITIONS
   */

  {
    let termsConditionsList = [];

    const termsConditionsLookup_modalEle = document.getElementById("is-termsConditions-lookup-modal");
    const termsConditionsLookup_resultsEle = document.getElementById("container--termsConditionsPrevious");

    const termsConditionsLookupFn_setTermsConditions = function(clickEvent) {

      clickEvent.preventDefault();

      const termsConditionsIndex = parseInt(clickEvent.currentTarget.getAttribute("data-terms-conditions-index"));

      document.getElementById("licence--termsConditions").value = termsConditionsList[termsConditionsIndex].termsConditions;

      window.llm.hideModal(termsConditionsLookup_modalEle);

      setUnsavedChanges();
    };

    document.getElementById("is-termsConditions-lookup-button").addEventListener("click", function() {

      termsConditionsList = [];
      window.llm.clearElement(termsConditionsLookup_resultsEle);

      const organizationID = document.getElementById("licence--organizationID").value;

      if (organizationID === "") {
        window.llm.alertModal("No Organization Selected", "An organization must be selected before the previously used terms and conditions can be retrieved.", "OK", "warning");
        return;
      }

      termsConditionsLookup_resultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
        "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
        "Loading previously used terms and conditions..." +
        "</p>";

      window.fetch("/licences/doGetDistinctTermsConditions", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            organizationID: organizationID
          })
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(termsConditionsListRes) {

          termsConditionsList = termsConditionsListRes;

          if (termsConditionsList.length === 0) {

            termsConditionsLookup_resultsEle.innerHTML = "<p class=\"has-text-centered\">" +
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

              listItemEle.innerHTML = "<p>" +
                window.llm.escapeHTML(termsConditionsObj.termsConditions) +
                "</p>" +
                "<p class=\"has-text-right\">" +
                (termsConditionsObj.termsConditionsCount > 1 ?
                  "<span class=\"tag is-light\">Used " + termsConditionsObj.termsConditionsCount + " times</span>" :
                  "") +
                "<span class=\"tag is-info\">" + termsConditionsObj.startDateMaxString + "</span>" +
                "</p>";
              listItemEle.addEventListener("click", termsConditionsLookupFn_setTermsConditions);
              listEle.insertAdjacentElement("beforeend", listItemEle);
            }

            window.llm.clearElement(termsConditionsLookup_resultsEle);

            termsConditionsLookup_resultsEle.insertAdjacentElement("beforeend", listEle);
          }
        });

      window.llm.showModal(termsConditionsLookup_modalEle);
    });

    const cancelButtonEles = termsConditionsLookup_modalEle.getElementsByClassName("is-close-modal-button");

    for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
      cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
    }
  }


  /*
   * LICENCE TYPE
   */

  const licenceType_selectEle = document.getElementById("licence--licenceTypeKey");

  if (isCreate) {

    const licenceType_fieldContainerEles = document.getElementsByClassName("container-licenceTypeFields");

    const changeFn_licenceType = function(changeEvent) {

      // ticket types

      const hasTicketTypes = changeEvent.currentTarget.selectedOptions[0].getAttribute("data-has-ticket-types") === "true";

      const totalPrizeValueEle = document.getElementById("licence--totalPrizeValue");

      if (hasTicketTypes) {
        document.getElementById("is-ticket-types-panel").classList.remove("is-hidden");

        totalPrizeValueEle.setAttribute("readonly", "readonly");
        totalPrizeValueEle.classList.add("is-readonly");

      } else {
        document.getElementById("is-ticket-types-panel").classList.add("is-hidden");

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

      const eventDateEles = events_containerEle.getElementsByTagName("input");

      for (let eleIndex = 0; eleIndex < eventDateEles.length; eleIndex += 1) {
        eventDateEles[eleIndex].setAttribute("min", startDateString);
      }
    };

    const dateFn_setMax = function() {

      const endDateString = endDateEle.value;

      const eventDateEles = events_containerEle.getElementsByTagName("input");

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
            // ignore
          }
        }
      }

      events_containerEle.insertAdjacentHTML("beforeend",
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
        "</div>");

      const buttonEles = events_containerEle.getElementsByTagName("a");
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

      window.llm.hideModal(eventCalculator_modalEle);
    });


    document.getElementById("is-event-calculator-button").addEventListener("click", function() {
      window.llm.showModal(eventCalculator_modalEle);
    });

    const cancelButtonEles = eventCalculator_modalEle.getElementsByClassName("is-close-modal-button");

    for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
      cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
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

    const addTicketType_openModal = function() {

      let addTicketType_closeModalFn;
      let addTicketType_ticketTypeEle;
      let addTicketType_unitCountEle;

      const licenceTypeKey = licenceType_selectEle.value;

      const addTicketType_addTicketType = function(formEvent) {
        formEvent.preventDefault();
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

      const addTicketType_populateTicketTypeSelect = function() {

        const ticketTypes = licenceTypeKeyToTicketTypes[licenceTypeKey];

        if (!ticketTypes || ticketTypes.length === 0) {
          addTicketType_closeModalFn();
          window.llm.alertModal("No ticket types available", "", "OK", "danger");
          return;
        }

        for (let ticketTypeIndex = 0; ticketTypeIndex < ticketTypes.length; ticketTypeIndex += 1) {

          const ticketTypeObj = ticketTypes[ticketTypeIndex];

          const optionEle = document.createElement("option");

          optionEle.setAttribute("data-ticket-price", ticketTypeObj.ticketPrice.toFixed(2));
          optionEle.setAttribute("data-ticket-count", ticketTypeObj.ticketCount);
          optionEle.setAttribute("data-prizes-per-deal", ticketTypeObj.prizesPerDeal.toFixed(2));
          optionEle.setAttribute("data-fee-per-unit", (ticketTypeObj.feePerUnit || 0).toFixed(2));

          optionEle.value = ticketTypeObj.ticketType;
          optionEle.innerText = ticketTypeObj.ticketType;

          addTicketType_ticketTypeEle.insertAdjacentElement("beforeend", optionEle);
        }

        addTicketType_refreshTicketTypeChange();
      };

      window.llm.openHtmlModal("licence-ticketTypeAdd", {

        onshow: function(modalEle) {
          addTicketType_ticketTypeEle = document.getElementById("ticketTypeAdd--ticketType");
          addTicketType_ticketTypeEle.addEventListener("change", addTicketType_refreshTicketTypeChange);

          addTicketType_unitCountEle = document.getElementById("ticketTypeAdd--unitCount");
          addTicketType_unitCountEle.addEventListener("change", addTicketType_refreshUnitCountChange);

          modalEle.getElementsByTagName("form")[0].addEventListener("submit", addTicketType_addTicketType);
        },

        onshown: function(modalEle, closeModalFn) {

          addTicketType_closeModalFn = closeModalFn;

          if (licenceTypeKey in licenceTypeKeyToTicketTypes) {
            addTicketType_populateTicketTypeSelect();
          } else {
            window.fetch("/licences/doGetTicketTypes", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  licenceTypeKey: licenceTypeKey
                })
              })
              .then(function(response) {
                return response.json();
              })
              .then(function(ticketTypes) {
                licenceTypeKeyToTicketTypes[licenceTypeKey] = ticketTypes;
                addTicketType_populateTicketTypeSelect();
              });
          }
        }
      });
    };

    document.getElementById("is-add-ticket-type-button").addEventListener("click", addTicketType_openModal);
  }


  /*
   * FEE PAYMENT
   */

  if (!isCreate) {

    if (feeFormEle) {

      // mark fee as paid form

      const submitFn_feeForm = function() {

        window.fetch("/licences/doMarkLicenceFeePaid", {
            method: "POST",
            credentials: "include",
            body: new URLSearchParams(new FormData(feeFormEle))
          })
          .then(function(response) {
            return response.json();
          })
          .then(function(responseJSON) {

            if (responseJSON.success) {
              window.llm.disableNavBlocker();
              window.location.reload(true);
            }
          });
      };

      feeFormEle.addEventListener("submit", function(formEvent) {
        formEvent.preventDefault();

        window.llm.confirmModal("Mark Fee as Paid?",
          "Are you sure you want to mark the licence fee as paid?",
          "Yes, Paid",
          "info",
          submitFn_feeForm);
      });

    } else {

      const confirmFn_removeFee = function() {

        window.fetch("/licences/doRemoveLicenceFee", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              licenceID: licenceID
            })
          })
          .then(function(response) {
            return response.json();
          })
          .then(function(responseJSON) {

            if (responseJSON.success) {
              window.llm.disableNavBlocker();
              window.location.reload(true);
            }
          });
      };

      // button to remove payment

      document.getElementById("is-remove-licence-fee-button").addEventListener("click", function() {

        window.llm.confirmModal("Remove Fee Payment?",
          "Are you sure you want to remove the fee payment and change the licence to unpaid?",
          "Yes, Remove Payment",
          "danger",
          confirmFn_removeFee);
      });
    }
  }
}());
