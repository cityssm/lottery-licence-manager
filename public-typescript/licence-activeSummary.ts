/* eslint-disable unicorn/filename-case, unicorn/prefer-module */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";
import * as llmTypes from "../types/recordTypes";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


(() => {

  const urlPrefix = document.querySelector("main").dataset.urlPrefix;

  let externalLicenceNumberFieldLabel = "";

  const formElement = document.querySelector("#form--activeSummary") as HTMLFormElement;
  const containerElement = document.querySelector("#container--activeSummary") as HTMLElement;

  const getActiveLicenceSummaryFunction = () => {

    containerElement.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading licences...</em>" +
      "</p>";

    cityssm.postJSON(urlPrefix + "/licences/doGetActiveLicenceSummary",
      formElement,
      (activeLicenceList: llmTypes.LotteryLicence[]) => {

        if (activeLicenceList.length === 0) {

          containerElement.innerHTML = "<div class=\"message is-info\">" +
            "<p class=\"message-body\">" +
            "There are no active licences on the selected time range." +
            "</p>" +
            "</div>";

          return;
        }

        const tableElement = document.createElement("table");
        tableElement.className = "table is-striped is-hoverable is-fullwidth has-sticky-header";
        tableElement.innerHTML = "<thead>" +
          "<tr>" +
          "<th>" + externalLicenceNumberFieldLabel + "</th>" +
          "<th>Licence Type</th>" +
          "<th>Organization</th>" +
          "<th>Location</th>" +
          "<th>Issue Date</th>" +
          "<th>Licence Start Date</th>" +
          "<th>Licence End Date</th>" +
          "</tr>" +
          "</thead>";

        const tbodyElement = document.createElement("tbody");

        for (const licenceObject of activeLicenceList) {

          const trElement = document.createElement("tr");

          trElement.innerHTML = ("<td>" +
            "<a href=\"/licences/" + licenceObject.licenceID.toString() + "\" data-tooltip=\"View Licence\">" +
            cityssm.escapeHTML(licenceObject.externalLicenceNumber) + "<br />" +
            "<small>Licence #" + licenceObject.licenceID.toString() + "</small>" +
            "</a>" +
            "</td>") +
            ("<td>" +
              (exports.config_licenceTypes[licenceObject.licenceTypeKey] as string || licenceObject.licenceTypeKey) +
              "</td>") +
            ("<td>" +
              "<a href=\"/organizations/" + licenceObject.organizationID.toString() + "\"" +
              " data-tooltip=\"View Organization\">" +
              cityssm.escapeHTML(licenceObject.organizationName) +
              "</a>" +
              "</td>") +
            ("<td>" +
              (licenceObject.locationID
                ? "<a href=\"/locations/" + licenceObject.locationID.toString() + "\" data-tooltip=\"View Location\">" +
                cityssm.escapeHTML(licenceObject.locationDisplayName) +
                "</a>" +
                (licenceObject.locationDisplayName === licenceObject.locationName
                  ? "<br /><small>" + cityssm.escapeHTML(licenceObject.locationAddress1) + "</small>"
                  : "")
                : "<span class=\"has-text-grey\">(No Location)</span>") +
              "</td>") +
            ("<td class=\"is-nowrap\">" + licenceObject.issueDateString + "</td>") +
            ("<td class=\"is-nowrap\">" +
              "<span class=\"icon\"><i class=\"fas fa-play\" aria-hidden=\"true\"></i></span> " +
              licenceObject.startDateString +
              "</td>") +
            ("<td class=\"is-nowrap\">" +
              "<span class=\"icon\"><i class=\"fas fa-stop\" aria-hidden=\"true\"></i></span> " +
              licenceObject.endDateString +
              "</td>");

          tbodyElement.append(trElement);
        }

        tableElement.append(tbodyElement);

        cityssm.clearElement(containerElement);

        containerElement.append(tableElement);
      }
    );
  };


  llm.initializeDateRangeSelector(
    document.querySelector(".is-date-range-selector[data-field-key='startEndDate']"),
    getActiveLicenceSummaryFunction
  );

  llm.getDefaultConfigProperty("externalLicenceNumber_fieldLabel", (fieldLabel: string) => {
    externalLicenceNumberFieldLabel = fieldLabel;
    getActiveLicenceSummaryFunction();
  });
})();
