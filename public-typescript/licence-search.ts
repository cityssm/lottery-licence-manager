/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type * as llmTypes from "../types/recordTypes";

declare const cityssm: cityssmGlobal;


(() => {

  const urlPrefix = document.querySelector("main").dataset.urlPrefix;

  const licenceType_keyToName = new Map<string, string>();

  const formElement = document.querySelector("#form--filters") as HTMLFormElement;

  const limitElement = document.querySelector("#filter--limit") as HTMLInputElement;
  const offsetElement = document.querySelector("#filter--offset") as HTMLInputElement;

  const searchResultsElement = document.querySelector("#container--searchResults") as HTMLElement;

  const externalLicenceNumberLabel = searchResultsElement.getAttribute("data-external-licence-number-label");


  const doLicenceSearchFunction = () => {

    const currentLimit = Number.parseInt(limitElement.value, 10);
    const currentOffset = Number.parseInt(offsetElement.value, 10);

    searchResultsElement.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading licences...</em>" +
      "</p>";

    cityssm.postJSON(urlPrefix + "/licences/doSearch",
      formElement,
      (licenceResults: { count: number; licences: llmTypes.LotteryLicence[] }) => {

        const licenceList = licenceResults.licences;

        if (licenceList.length === 0) {

          searchResultsElement.innerHTML = "<div class=\"message is-info\">" +
            "<div class=\"message-body\">" +
            "<strong>Your search returned no results.</strong><br />" +
            "Please try expanding your search criteria." +
            "</div>" +
            "</div>";

          return;
        }

        searchResultsElement.innerHTML = "<table class=\"table is-fullwidth is-striped is-hoverable\">" +
          "<thead><tr>" +
          "<th>" + cityssm.escapeHTML(externalLicenceNumberLabel) + "</th>" +
          "<th>Licence</th>" +
          "<th>Organization Name</th>" +
          "<th>Location</th>" +
          "<th>Active Date Range</th>" +
          "<th class=\"is-hidden-print\"><span class=\"sr-only\">Options</span></th>" +
          "</tr></thead>" +
          "<tbody></tbody>" +
          "</table>";

        const tbodyElement = searchResultsElement.querySelector("tbody");

        for (const licenceObject of licenceList) {

          const licenceType = licenceType_keyToName.get(licenceObject.licenceTypeKey);

          const trElement = document.createElement("tr");

          let locationHTML = "";

          locationHTML = licenceObject.locationID
            ? ("<a data-tooltip=\"View Location\" href=\"" + cityssm.escapeHTML(urlPrefix) + "/locations/" + licenceObject.locationID.toString() + "\">" +
              cityssm.escapeHTML(licenceObject.locationDisplayName) +
              "</a>" +
              (licenceObject.locationDisplayName === licenceObject.locationAddress1
                ? ""
                : `<br /> <small>${cityssm.escapeHTML(licenceObject.locationAddress1)} </small>`))
            : "<span class=\"has-text-grey\">(No Location Set)</span>";

          trElement.innerHTML =
            ("<td>" +
              "<a data-tooltip=\"View Licence\" href=\"" + cityssm.escapeHTML(urlPrefix) + "/licences/" + licenceObject.licenceID.toString() + "\">" +
              cityssm.escapeHTML(licenceObject.externalLicenceNumber) + "<br />" +
              "<small>Licence #" + licenceObject.licenceID.toString() + "</small>" +
              "</a>" +
              "</td>") +

            ("<td>" + cityssm.escapeHTML(licenceType || licenceObject.licenceTypeKey) + "<br />" +
              "<small>" + cityssm.escapeHTML(licenceObject.licenceDetails) + "</small>" +
              "</td>") +

            ("<td>" +
              "<a data-tooltip=\"View Organization\"" +
              " href=\"" + cityssm.escapeHTML(urlPrefix) + "/organizations/" + licenceObject.organizationID.toString() + "\">" +
              cityssm.escapeHTML(licenceObject.organizationName) +
              "</a>" +
              "</td>") +

            ("<td>" + locationHTML + "</td>") +

            ("<td class=\"is-nowrap\">" +
              "<span class=\"has-cursor-default has-tooltip-right\" data-tooltip=\"Start Date\">" +
              "<i class=\"fas fa-fw fa-play\" aria-hidden=\"true\"></i> " + licenceObject.startDateString +
              "</span><br />" +
              "<span class=\"has-cursor-default has-tooltip-right\" data-tooltip=\"End Date\">" +
              "<i class=\"fas fa-fw fa-stop\" aria-hidden=\"true\"></i> " + licenceObject.endDateString +
              "</span>" +
              "</td>") +

            "<td class=\"has-text-right is-nowrap is-hidden-print\">" +

            (licenceObject.canUpdate
              ? "<a class=\"button is-small\" data-tooltip=\"Edit Licence\"" +
              " href=\"" + cityssm.escapeHTML(urlPrefix) + "/licences/" + licenceObject.licenceID.toString() + "/edit\">" +
              "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
              "<span>Edit</span>" +
              "</a> "
              : "") +

            (licenceObject.issueDate
              ? "<a class=\"button is-small\" data-tooltip=\"Print Licence\"" +
              " href=\"" + cityssm.escapeHTML(urlPrefix) + "/licences/" + licenceObject.licenceID.toString() + "/print\" download>" +
              "<i class=\"fas fa-print\" aria-hidden=\"true\"></i>" +
              "<span class=\"sr-only\">Print</span>" +
              "</a>"
              : "<span class=\"tag is-warning\">Not Issued</span>") +
            "</div>" +

            "</td>";

          tbodyElement.append(trElement);

        }

        searchResultsElement.insertAdjacentHTML("beforeend", "<div class=\"level is-block-print\">" +
          "<div class=\"level-left has-text-weight-bold\">" +
          "Displaying licences " +
          (currentOffset + 1).toString() +
          " to " +
          Math.min(currentLimit + currentOffset, licenceResults.count).toString() +
          " of " +
          licenceResults.count.toString() +
          "</div>" +
          "</div>");

        if (currentLimit < licenceResults.count) {

          const paginationElement = document.createElement("nav");
          paginationElement.className = "level-right is-hidden-print";
          paginationElement.setAttribute("role", "pagination");
          paginationElement.setAttribute("aria-label", "pagination");

          if (currentOffset > 0) {

            const previousElement = document.createElement("a");
            previousElement.className = "button";
            previousElement.textContent = "Previous";
            previousElement.addEventListener("click", (clickEvent) => {

              clickEvent.preventDefault();
              offsetElement.value = Math.max(0, currentOffset - currentLimit).toString();
              doLicenceSearchFunction();

            });

            paginationElement.append(previousElement);
          }

          if (currentLimit + currentOffset < licenceResults.count) {

            const nextElement = document.createElement("a");
            nextElement.className = "button ml-3";

            nextElement.innerHTML =
              "<span>Next Licences</span>" +
              "<span class=\"icon\"><i class=\"fas fa-chevron-right\" aria-hidden=\"true\"></i></span>";

            nextElement.addEventListener("click", (clickEvent) => {

              clickEvent.preventDefault();
              offsetElement.value = (currentOffset + currentLimit).toString();
              doLicenceSearchFunction();
            });

            paginationElement.append(nextElement);
          }

          searchResultsElement.querySelector(".level").append(paginationElement);
        }
      }
    );
  };


  const resetOffsetAndDoLicenceSearchFunction = () => {
    offsetElement.value = "0";
    doLicenceSearchFunction();
  };

  const licenceTypeOptionElements = document.querySelectorAll("#filter--licenceTypeKey option") as NodeListOf<HTMLOptionElement>;

  // Start at 1 to skip the blank first record
  for (let optionIndex = 1; optionIndex < licenceTypeOptionElements.length; optionIndex += 1) {

    const optionElement = licenceTypeOptionElements[optionIndex];
    licenceType_keyToName.set(optionElement.value, optionElement.textContent);
  }


  formElement.addEventListener("submit", (formEvent) => {
    formEvent.preventDefault();
  });

  const inputElements = formElement.querySelectorAll(".input, .select select");

  for (const inputElement of inputElements) {
    inputElement.addEventListener("change", resetOffsetAndDoLicenceSearchFunction);
  }

  resetOffsetAndDoLicenceSearchFunction();
})();
