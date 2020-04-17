"use strict";

(function() {

  const canUpdate = document.getElementsByTagName("main")[0].getAttribute("data-can-update") === "true";

  const inactiveYearsFilterEle = document.getElementById("filter--inactiveYears");

  const searchResultsEle = document.getElementById("container--searchResults");

  /**
   * @param {MouseEvent} clickEvent
   */
  function confirmDeleteOrganizationFn(clickEvent) {

    const buttonEle = clickEvent.currentTarget;
    const organizationName = cityssm.escapeHTML(buttonEle.getAttribute("data-organization-name"));

    const deleteFn = function() {

      const organizationID = buttonEle.getAttribute("data-organization-id");

      cityssm.postJSON("/organizations/doDelete", {
        organizationID: organizationID
      }, function(responseJSON) {

        if (responseJSON.success) {

          cityssm.alertModal(responseJSON.message, "", "OK", "success");
          buttonEle.closest("tr").remove();

        } else {

          cityssm.alertModal(responseJSON.message, "", "OK", "danger");

        }

      });

    };

    cityssm.confirmModal(
      "Delete Organization?",
      "Are you sure you want delete " + organizationName + "?",
      "Yes, Delete",
      "danger",
      deleteFn
    );

  }

  function getInactiveOrganizations() {

    searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading organizations...</em>" +
      "</p>";

    cityssm.postJSON("/organizations/doGetInactive", {
      inactiveYears: inactiveYearsFilterEle.value
    }, function(inactiveList) {

      if (inactiveList.length === 0) {

        searchResultsEle.innerHTML = "<div class=\"message is-info\">" +
          "<p class=\"message-body\">" +
          "There are no inactive organizations to report." +
          "</p>" +
          "</div>";

        return;

      }

      const tableEle = document.createElement("table");
      tableEle.className = "table is-fullwidth is-striped is-hoverable";

      tableEle.innerHTML = "<thead>" +
        "<tr>" +
        "<th>Organization</th>" +
        "<th class=\"has-text-centered\">Last Licence End Date</th>" +
        "<th class=\"has-text-centered\">Last Updated</th>" +
        (canUpdate ? "<th><span class=\"sr-only\">Delete</span></th>" : "") +
        "</tr>" +
        "</thead>";

      const tbodyEle = document.createElement("tbody");

      for (let i = 0; i < inactiveList.length; i += 1) {

        const organizationObj = inactiveList[i];

        const trEle = document.createElement("tr");

        const safeOrganizationName = cityssm.escapeHTML(organizationObj.organizationName);

        trEle.insertAdjacentHTML("beforeend", "<td>" +
          "<a data-tooltip=\"View Organization\"" +
          " href=\"/organizations/" + organizationObj.organizationID + "\">" +
          safeOrganizationName +
          "</a>" +
          "</td>");

        trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
          (organizationObj.licences_endDateMax ?
            organizationObj.licences_endDateMaxString :
            "<span class=\"tag is-light is-danger\">No Licences</span>") +
          "</td>");

        trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
          "<span data-tooltip=\"Updated by " + organizationObj.recordUpdate_userName + "\">" + organizationObj.recordUpdate_dateString + "</span>" +
          "</td>");

        if (canUpdate) {

          trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
            "<button class=\"button is-small is-danger\"" +
            " data-tooltip=\"Delete Organization\"" +
            " data-organization-id=\"" + organizationObj.organizationID + "\"" +
            " data-organization-name=\"" + safeOrganizationName + "\" type=\"button\">" +
            "<span class=\"icon\"><i class=\"fas fa-trash\" aria-hidden=\"true\"></i></span> <span>Delete</span>" +
            "</button>" +
            "</td>");

          trEle.getElementsByTagName("button")[0].addEventListener("click", confirmDeleteOrganizationFn);

        }

        tbodyEle.insertAdjacentElement("beforeend", trEle);

      }

      tableEle.insertAdjacentElement("beforeend", tbodyEle);

      cityssm.clearElement(searchResultsEle);

      searchResultsEle.insertAdjacentElement("beforeend", tableEle);

    });

  }

  inactiveYearsFilterEle.addEventListener("change", getInactiveOrganizations);

  getInactiveOrganizations();

}());
