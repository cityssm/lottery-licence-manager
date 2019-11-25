/* global window, document */
/* global bulmaCalendar */


(function() {
  "use strict";

  // initialize organization lookup

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

  const cancelButtonEles = organizationLookup_modalEle.getElementsByClassName("is-cancel-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
    cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
  }


  // initialize calendars

  bulmaCalendar.attach("[type='date']", window.llm.bulmaCalendarOptions);
  window.llm.fixBulmaCalendars();
  bulmaCalendar.attach("[type='time']", window.llm.bulmaTimeOptions);
  window.llm.fixBulmaTimes();


  // initialize licence type select

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
}());
