/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type * as llmTypes from "../types/recordTypes";

declare const cityssm: cityssmGlobal;


(() => {

  const urlPrefix = document.querySelector("main").dataset.urlPrefix;
  const safeUrlPrefix = cityssm.escapeHTML(urlPrefix);

  const canUpdate = document.querySelector("main").dataset.canUpdate === "true";

  const inactiveYearsFilterElement = document.querySelector("#filter--inactiveYears") as HTMLSelectElement;

  const searchResultsElement = document.querySelector("#container--searchResults") as HTMLElement;


  const confirmDeleteOrganizationFunction = (clickEvent: Event) => {

    const buttonElement = clickEvent.currentTarget as HTMLButtonElement;
    const organizationName = buttonElement.getAttribute("data-organization-name");

    const deleteFunction = () => {

      const organizationID = buttonElement.getAttribute("data-organization-id");

      cityssm.postJSON(urlPrefix + "/organizations/doDelete", {
        organizationID
      },
        (responseJSON: { success: boolean; message: string }) => {

          if (responseJSON.success) {

            cityssm.alertModal(responseJSON.message, "", "OK", "success");
            buttonElement.closest("tr").remove();

          } else {
            cityssm.alertModal(responseJSON.message, "", "OK", "danger");
          }
        });
    };

    cityssm.confirmModal(
      "Delete Organization?",
      "Are you sure you want delete " + cityssm.escapeHTML(organizationName) + "?",
      "Yes, Delete",
      "danger",
      deleteFunction
    );
  };

  const getInactiveOrganizationsFunction = () => {

    searchResultsElement.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading organizations...</em>" +
      "</p>";

    cityssm.postJSON(urlPrefix + "/organizations/doGetInactive", {
      inactiveYears: inactiveYearsFilterElement.value
    },
      (inactiveList: llmTypes.Organization[]) => {

        if (inactiveList.length === 0) {

          searchResultsElement.innerHTML = "<div class=\"message is-info\">" +
            "<p class=\"message-body\">" +
            "There are no inactive organizations to report." +
            "</p>" +
            "</div>";

          return;

        }

        const tableElement = document.createElement("table");
        tableElement.className = "table is-fullwidth is-striped is-hoverable has-sticky-header";

        tableElement.innerHTML = "<thead>" +
          "<tr>" +
          "<th>Organization</th>" +
          "<th class=\"has-text-centered\">Last Licence End Date</th>" +
          "<th class=\"has-text-centered\">Created</th>" +
          "<th class=\"has-text-centered\">Last Updated</th>" +
          (canUpdate ? "<th><span class=\"sr-only\">Delete</span></th>" : "") +
          "</tr>" +
          "</thead>";

        const tbodyElement = document.createElement("tbody");

        for (const organizationObject of inactiveList) {

          const trElement = document.createElement("tr");

          const safeOrganizationName = cityssm.escapeHTML(organizationObject.organizationName);

          trElement.innerHTML = ("<td>" +
            "<a data-tooltip=\"View Organization\"" +
            " href=\"" + safeUrlPrefix + "/organizations/" + organizationObject.organizationID.toString() + "\">" +
            safeOrganizationName +
            "</a>" +
            "</td>") +
            ("<td class=\"has-text-centered\">" +
              (organizationObject.licences_endDateMax
                ? organizationObject.licences_endDateMaxString
                : "<span class=\"tag is-light is-danger\">No Licences</span>") +
              "</td>") +
            ("<td class=\"has-text-centered\">" +
              "<span data-tooltip=\"Created by " + organizationObject.recordCreate_userName + "\">" +
              organizationObject.recordCreate_dateString +
              "</span>" +
              "</td>") +
            ("<td class=\"has-text-centered\">" +
              "<span data-tooltip=\"Updated by " + organizationObject.recordUpdate_userName + "\">" +
              organizationObject.recordUpdate_dateString +
              "</span>" +
              "</td>");

          if (canUpdate) {

            trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
              "<button class=\"button is-small is-danger\"" +
              " data-tooltip=\"Delete Organization\"" +
              " data-organization-id=\"" + organizationObject.organizationID.toString() + "\"" +
              " data-organization-name=\"" + safeOrganizationName + "\" type=\"button\">" +
              "<span class=\"icon\"><i class=\"fas fa-trash\" aria-hidden=\"true\"></i></span> <span>Delete</span>" +
              "</button>" +
              "</td>");

            trElement.querySelector("button").addEventListener("click", confirmDeleteOrganizationFunction);

          }

          tbodyElement.append(trElement);
        }

        tableElement.append(tbodyElement);

        cityssm.clearElement(searchResultsElement);

        searchResultsElement.append(tableElement);

      });
  };

  inactiveYearsFilterElement.addEventListener("change", getInactiveOrganizationsFunction);

  getInactiveOrganizationsFunction();

})();
