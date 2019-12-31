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

    document.getElementsByClassName("is-delete-button")[0].addEventListener("click", function(clickEvent) {
      clickEvent.preventDefault();

      window.llm.confirmModal("Delete Licence?", "Are you sure you want to delete this licence and all events associated with it?", "Yes, Delete", "danger", function() {

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


  const externalLicenceNumberUnlockBtnEles = document.getElementsByClassName("is-external-licence-number-unlock-button");

  if (externalLicenceNumberUnlockBtnEles.length) {
    externalLicenceNumberUnlockBtnEles[0].addEventListener("click", function() {
      const externalLicenceNumberEle = document.getElementById("licence--externalLicenceNumber");
      externalLicenceNumberEle.classList.remove("has-background-light");
      externalLicenceNumberEle.classList.remove("has-cursor-not-allowed");
      externalLicenceNumberEle.removeAttribute("readonly");
      externalLicenceNumberEle.focus();
    });
  }


  /*
   * ORGANIZATION LOOKUP
   */


  let organizationList = [];

  const organizationLookup_modalEle = document.getElementsByClassName("is-organization-lookup-modal")[0];
  const organizationLookup_searchStrEle = document.getElementById("organizationLookup--searchStr");
  const organizationLookup_resultsEle = document.getElementById("container--organizationLookup");

  function organizationLookup_setOrganization(clickEvent) {

    clickEvent.preventDefault();

    const organizationEle = clickEvent.currentTarget;

    document.getElementById("licence--organizationID").value = organizationEle.getAttribute("data-organization-id");
    document.getElementById("licence--organizationName").value = organizationEle.getAttribute("data-organization-name");

    window.llm.hideModal(organizationEle);

    setUnsavedChanges();
  }

  function organizationLookup_refreshResults() {

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
        listItemEle.addEventListener("click", organizationLookup_setOrganization);
        listEle.insertAdjacentElement("beforeend", listItemEle);
      }
    }

    window.llm.clearElement(organizationLookup_resultsEle);

    organizationLookup_resultsEle.insertAdjacentElement("beforeend", listEle);
  }

  organizationLookup_searchStrEle.addEventListener("keyup", organizationLookup_refreshResults);

  document.getElementsByClassName("is-organization-lookup-button")[0].addEventListener("click", function() {

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
          organizationLookup_refreshResults();
        });
    }

    window.llm.showModal(organizationLookup_modalEle);
  });

  let cancelButtonEles = organizationLookup_modalEle.getElementsByClassName("is-close-modal-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
    cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
  }


  /*
   * LOCATION LOOKUP
   */

  let locationList = [];

  const locationLookup_modalEle = document.getElementById("is-location-lookup-modal");
  const locationLookup_searchStrEle = document.getElementById("locationLookup--searchStr");
  const locationLookup_resultsEle = document.getElementById("container--locationLookup");
  const locationLookup_createFormEle = document.getElementById("form--newLocation");


  function locationLookup_setLocation(locationID, locationDisplayName) {

    document.getElementById("licence--locationID").value = locationID;
    document.getElementById("licence--locationDisplayName").value = locationDisplayName;
  }


  function locationLookup_setLocationFromExisting(clickEvent) {

    clickEvent.preventDefault();

    const locationEle = clickEvent.currentTarget;

    locationLookup_setLocation(locationEle.getAttribute("data-location-id"), locationEle.getAttribute("data-location-display-name"));

    window.llm.hideModal(locationEle);

    setUnsavedChanges();
  }

  function locationLookup_refreshResults() {

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
        listItemEle.addEventListener("click", locationLookup_setLocationFromExisting);
        listEle.insertAdjacentElement("beforeend", listItemEle);
      }
    }

    window.llm.clearElement(locationLookup_resultsEle);

    locationLookup_resultsEle.insertAdjacentElement("beforeend", listEle);
  }

  locationLookup_searchStrEle.addEventListener("keyup", locationLookup_refreshResults);

  locationLookup_createFormEle.addEventListener("submit", function(formEvent) {
    formEvent.preventDefault();

    window.fetch("/locations/doCreate", {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams(new FormData(locationLookup_createFormEle))
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(responseJSON) {

        if (responseJSON.success) {
          locationList = [];
          locationLookup_setLocation(responseJSON.locationID, responseJSON.locationDisplayName);
          window.llm.hideModal(locationLookup_modalEle);
        }
      });
  });

  document.getElementsByClassName("is-location-lookup-button")[0].addEventListener("click", function() {

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
          locationLookup_searchStrEle.removeAttribute("disabled");
          locationLookup_refreshResults();
        });
    }

    window.llm.showModal(locationLookup_modalEle);
  });

  cancelButtonEles = locationLookup_modalEle.getElementsByClassName("is-close-modal-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
    cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
  }

  window.llm.initializeTabs(locationLookup_modalEle.querySelector(".tabs ul"));



  /*
   * TERMS AND CONDITIONS
   */

  let termsConditionsList = [];

  const termsConditionsLookup_modalEle = document.getElementById("is-termsConditions-lookup-modal");
  const termsConditionsLookup_resultsEle = document.getElementById("container--termsConditionsPrevious");

  function termsConditionsLookup_setTermsConditions(clickEvent) {

    clickEvent.preventDefault();

    const termsConditionsIndex = parseInt(clickEvent.currentTarget.getAttribute("data-terms-conditions-index"));

    document.getElementById("licence--termsConditions").value = termsConditionsList[termsConditionsIndex].termsConditions;

    window.llm.hideModal(termsConditionsLookup_modalEle);

    setUnsavedChanges();
  }

  document.getElementsByClassName("is-termsConditions-lookup-button")[0].addEventListener("click", function() {

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
            listItemEle.addEventListener("click", termsConditionsLookup_setTermsConditions);
            listEle.insertAdjacentElement("beforeend", listItemEle);
          }

          window.llm.clearElement(termsConditionsLookup_resultsEle);

          termsConditionsLookup_resultsEle.insertAdjacentElement("beforeend", listEle);
        }
      });

    window.llm.showModal(termsConditionsLookup_modalEle);
  });

  cancelButtonEles = termsConditionsLookup_modalEle.getElementsByClassName("is-close-modal-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
    cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
  }


  /*
   * LICENCE TYPE
   */


  const licenceType_selectEle = document.getElementById("licence--licenceTypeKey");
  const licenceType_fieldContainerEles = document.getElementsByClassName("container-licenceTypeFields");

  function licenceType_refreshFields(changeEvent) {

    const idToShow = "container-licenceTypeFields--" + changeEvent.currentTarget.value;

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
  }

  licenceType_selectEle.addEventListener("change", licenceType_refreshFields);


  /*
   * DATES
   */


  const startDateEle = document.getElementById("licence--startDateString");
  const endDateEle = document.getElementById("licence--endDateString");

  function dates_setMin() {

    const startDateString = startDateEle.value;

    endDateEle.setAttribute("min", startDateString);

    if (endDateEle.value < startDateString) {
      endDateEle.value = startDateString;
    }

    const eventDateEles = events_containerEle.getElementsByTagName("input");

    for (let eleIndex = 0; eleIndex < eventDateEles.length; eleIndex += 1) {
      eventDateEles[eleIndex].setAttribute("min", startDateString);
    }
  }

  function dates_setMax() {

    const endDateString = endDateEle.value;

    const eventDateEles = events_containerEle.getElementsByTagName("input");

    for (let eleIndex = 0; eleIndex < eventDateEles.length; eleIndex += 1) {
      eventDateEles[eleIndex].setAttribute("max", endDateString);
    }
  }

  document.getElementById("licence--applicationDateString").addEventListener("change", function(changeEvent) {
    startDateEle.setAttribute("min", changeEvent.currentTarget.value);
  });

  startDateEle.addEventListener("change", dates_setMin);
  endDateEle.addEventListener("change", dates_setMax);


  /*
   * EVENTS
   */


  function events_remove(clickEvent) {
    clickEvent.currentTarget.closest(".panel-block").remove();

    doRefreshAfterSave = true;
    setUnsavedChanges();
  }

  function events_add(eventDate) {

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
    buttonEles[buttonEles.length - 1].addEventListener("click", events_remove);

    doRefreshAfterSave = true;
    setUnsavedChanges();
  }

  const eventCalculator_modalEle = document.getElementsByClassName("is-event-calculator-modal")[0];

  document.getElementsByClassName("is-calculate-events-button")[0].addEventListener("click", function() {

    const eventCount = parseInt(document.getElementById("eventCalc--eventCount").value);
    const dayInterval = parseInt(document.getElementById("eventCalc--dayInterval").value);

    let dateSplit = endDateEle.value.split("-");

    const endDate = new Date(dateSplit[0], parseInt(dateSplit[1]) - 1, dateSplit[2]);

    dateSplit = startDateEle.value.split("-");

    let eventDate = new Date(dateSplit[0], parseInt(dateSplit[1]) - 1, dateSplit[2]);

    for (let eventNum = 0; eventNum < eventCount && eventDate.getTime() <= endDate.getTime(); eventNum += 1) {

      events_add(eventDate);

      eventDate.setDate(eventDate.getDate() + dayInterval);
    }

    window.llm.hideModal(eventCalculator_modalEle);
  });


  document.getElementsByClassName("is-event-calculator-button")[0].addEventListener("click", function() {
    window.llm.showModal(eventCalculator_modalEle);
  });

  cancelButtonEles = eventCalculator_modalEle.getElementsByClassName("is-close-modal-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
    cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
  }

  const addEventBtnEles = document.getElementsByClassName("is-add-event-button");

  for (let btnIndex = 0; btnIndex < addEventBtnEles.length; btnIndex += 1) {
    addEventBtnEles[btnIndex].addEventListener("click", events_add);
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

      document.getElementsByClassName("is-remove-licence-fee-button")[0].addEventListener("click", function() {

        window.llm.confirmModal("Remove Fee Payment?",
          "Are you sure you want to remove the fee payment and change the licence to unpaid?",
          "Yes, Remove Payment",
          "danger",
          confirmFn_removeFee);
      });
    }
  }
}());
