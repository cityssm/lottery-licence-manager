/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type * as llmTypes from "../types/recordTypes";

declare const cityssm: cityssmGlobal;


(() => {

  const urlPrefix = document.querySelector("main").dataset.urlPrefix;

  const formElement = document.querySelector("#form--filters") as HTMLFormElement;
  const searchResultsElement = document.querySelector("#container--searchResults") as HTMLElement;

  const canCreate = document.querySelector("main").dataset.canCreate === "true";


  const doOrganizationSearchFunction = () => {

    searchResultsElement.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading organizations...</em>" +
      "</p>";

    cityssm.postJSON(urlPrefix + "/organizations/doSearch",
      formElement,
      (organizationsList: llmTypes.Organization[]) => {

        if (organizationsList.length === 0) {

          searchResultsElement.innerHTML = "<div class=\"message is-info\">" +
            "<div class=\"message-body\">" +
            "<strong>Your search returned no results.</strong><br />" +
            "Please try expanding your search criteria." +
            "</div>" +
            "</div>";

          return;
        }

        searchResultsElement.innerHTML = "<table class=\"table is-fullwidth is-striped is-hoverable has-sticky-header\">" +
          "<thead><tr>" +
          "<th colspan=\"2\">Organization Name</th>" +
          "<th>Default Representative</th>" +
          (canCreate ? "<th class=\"is-hidden-print\"><span class=\"sr-only\">Organization Options</span></th>" : "") +
          "<th>Licences</th>" +
          (canCreate ? "<th class=\"is-hidden-print\"><span class=\"sr-only\">Licence Options</span></th>" : "") +
          "</tr></thead>" +
          "<tbody></tbody>" +
          "</table>";

        const tbodyElement = searchResultsElement.querySelector("tbody");

        for (const organizationObject of organizationsList) {

          const trElement = document.createElement("tr");
          trElement.innerHTML = "<td></td>";

          const organizationNameLinkElement = document.createElement("a");

          if (!organizationObject.isEligibleForLicences) {

            organizationNameLinkElement.className = "has-text-danger";
            organizationNameLinkElement.dataset.tooltip = "Not Eligible for New Licences";

          } else {

            organizationNameLinkElement.dataset.tooltip = "View Organization";
          }

          organizationNameLinkElement.textContent = organizationObject.organizationName;
          organizationNameLinkElement.href = "organizations/" + organizationObject.organizationID.toString();
          trElement.querySelector("td").append(organizationNameLinkElement);

          trElement.insertAdjacentHTML(
            "beforeend",
            "<td class=\"has-text-right\">" +
            (organizationObject.organizationNote === ""
              ? ""
              : "<span class=\"tag has-cursor-default is-info is-light\"" +
              " data-tooltip=\"" +
              cityssm.escapeHTML(organizationObject.organizationNote.length > 30
                ? organizationObject.organizationNote.slice(0, 27) + "..."
                : organizationObject.organizationNote) +
              "\">" +
              "<i class=\"fas fa-sticky-note mr-2\" aria-hidden=\"true\"></i> Note" +
              "</span>"
            ) +
            "</td>"
          );

          trElement.insertAdjacentHTML(
            "beforeend",
            "<td>" +
            (organizationObject.representativeName || "<span class=\"has-text-grey\">(No Representatives)</span>") +
            "</td>"
          );

          if (canCreate) {

            trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-hidden-print\">" +
              (organizationObject.canUpdate
                ? "<a class=\"button is-small\" data-tooltip=\"Edit Organization\"" +
                " href=\"organizations/" + organizationObject.organizationID.toString() + "/edit\">" +
                "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                "<span>Edit</span>" +
                "</a>"
                : "") +
              "</td>");

          }

          let licenceHTML = "";

          if (organizationObject.licences_activeCount > 0) {

            licenceHTML = "<span class=\"tag has-cursor-default is-info\" data-tooltip=\"Number of Active Licences\">" +
              "<i class=\"fas fa-certificate mr-2\" aria-hidden=\"true\"></i> " +
              organizationObject.licences_activeCount.toString() +
              "</span>";

          } else if (organizationObject.licences_endDateMax) {

            licenceHTML = "<span class=\"tag has-cursor-default is-info is-light\"" +
              " data-tooltip=\"Last Licence End Date\">" +
              "<i class=\"fas fa-stop mr-2\" aria-hidden=\"true\"></i> " + organizationObject.licences_endDateMaxString +
              "</span>";

          }


          trElement.insertAdjacentHTML("beforeend", "<td>" + licenceHTML + "</td>");

          if (canCreate) {

            trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-hidden-print\">" +
              (organizationObject.isEligibleForLicences
                ? "<a class=\"button is-small\" data-tooltip=\"Create a New Licence\"" +
                " href=\"licences/new/" + organizationObject.organizationID.toString() + "\">" +
                "<span class=\"icon\"><i class=\"fas fa-certificate\" aria-hidden=\"true\"></i></span>" +
                "<span>New</span>" +
                "</a>"
                : "") +
              "</td>");

          }

          tbodyElement.append(trElement);
        }
      }
    );
  };


  formElement.addEventListener("submit", (formEvent) => {
    formEvent.preventDefault();
  });

  const inputElements = formElement.querySelectorAll("input, select");

  for (const inputElement of inputElements) {
    inputElement.addEventListener("change", doOrganizationSearchFunction);
  }

  doOrganizationSearchFunction();

})();
