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

  let events_areModified = false;
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

    window.fetch("/licences/doSave", {
        method: "post",
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

          if (responseJSON.success && events_areModified) {
            window.location.reload(true);
          } else {
            formMessageEle.innerHTML = "<span class=\"" + (responseJSON.success ? "has-text-success" : "has-text-danger") + "\">" +
              responseJSON.message +
              "</span>";
          }
        }
      });
  });

  if (!isCreate) {

    document.getElementsByClassName("is-delete-button")[0].addEventListener("click", function(clickEvent) {
      clickEvent.preventDefault();

      window.llm.confirmModal("Delete Licence?", "Are you sure you want to delete this licence?", "Yes, Delete", "danger", function() {

        window.fetch("/licences/doDelete", {
            method: "post",
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

  function setUnsavedChanges() {
    window.llm.enableNavBlocker();
    formMessageEle.innerHTML = "<div class=\"is-size-7 has-text-info\">" +
      "<i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i> Unsaved Changes" +
      "</div>";
  }

  const inputEles = formEle.querySelectorAll("input, select, textarea");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
    if (inputEles[inputIndex].name !== "") {
      inputEles[inputIndex].addEventListener("change", setUnsavedChanges);
    }
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
  }

  function organizationLookup_refreshResults() {

    const listEle = document.createElement("div");
    listEle.className = "list is-hoverable";

    const searchStringSplit = organizationLookup_searchStrEle.value.trim().toLowerCase().split(" ");

    let displayLimit = 10;

    for (let organizationIndex = 0; organizationIndex < organizationList.length && displayLimit > 0; organizationIndex += 1) {

      let doDisplayRecord = true;

      const organizationObj = organizationList[organizationIndex];
      const organizationName = organizationObj.OrganizationName.toLowerCase();

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
        listItemEle.setAttribute("data-organization-id", organizationObj.OrganizationID);
        listItemEle.setAttribute("data-organization-name", organizationObj.OrganizationName);
        listItemEle.innerText = organizationObj.OrganizationName;
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
          method: "get",
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

  let cancelButtonEles = organizationLookup_modalEle.getElementsByClassName("is-cancel-button");

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
    clickEvent.currentTarget.closest(".field").remove();

    events_areModified = true;
    setUnsavedChanges();
  }

  function events_add(eventDate) {

    let eventDateString = "";

    if (eventDate && eventDate instanceof Date) {
      eventDateString = eventDate.getFullYear() + "-" +
        ("00" + (eventDate.getMonth() + 1)).slice(-2) + "-" +
        ("00" + eventDate.getDate()).slice(-2);
    }

    events_containerEle.insertAdjacentHTML("beforeend", "<div class=\"field has-addons\">" +
      "<div class=\"control is-expanded has-icons-left\">" +
      "<input class=\"input is-small\" name=\"eventDate\" type=\"date\"" +
      " value=\"" + eventDateString + "\"" +
      " min=\"" + startDateEle.value + "\"" +
      " max=\"" + endDateEle.value + "\"" +
      " required />" +
      "<span class=\"icon is-left\">" +
      "<i class=\"fas fa-calendar\"></i>" +
      "</span>" +
      "</div>" +
      "<div class=\"control\">" +
      "<a class=\"button is-small is-danger\" role=\"button\" title=\"Remove Event\"><i class=\"fas fa-trash\"></i></a>" +
      "</div>" +
      "</div>");

    const buttonEles = events_containerEle.getElementsByTagName("a");
    buttonEles[buttonEles.length - 1].addEventListener("click", events_remove);

    events_areModified = true;
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

  cancelButtonEles = eventCalculator_modalEle.getElementsByClassName("is-cancel-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
    cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
  }

  document.getElementsByClassName("is-add-event-button")[0].addEventListener("click", events_add);
}());
