import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/types";
declare const cityssm: cityssmGlobal;

import type { llmGlobal } from "./types";
declare const llm: llmGlobal;


(function() {

  let externalLicenceNumberFieldLabel = "";

  const formEle = document.getElementById("form--activeSummary");
  const containerEle = document.getElementById("container--activeSummary");

  function getActiveLicenceSummary() {

    containerEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading licences...</em>" +
      "</p>";

    cityssm.postJSON(
      "/licences/doGetActiveLicenceSummary", formEle,
      function(activeLicenceList) {

        if (activeLicenceList.length === 0) {

          containerEle.innerHTML = "<div class=\"message is-info\">" +
            "<p class=\"message-body\">" +
            "There are no active licences on the selected time range." +
            "</p>" +
            "</div>";

          return;

        }

        const tableEle = document.createElement("table");
        tableEle.className = "table is-striped is-hoverable is-fullwidth";
        tableEle.innerHTML = "<thead>" +
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

        const tbodyEle = document.createElement("tbody");

        for (let index = 0; index < activeLicenceList.length; index += 1) {

          const licenceObj = activeLicenceList[index];

          const trEle = document.createElement("tr");

          trEle.innerHTML = ("<td>" +
              "<a href=\"/licences/" + licenceObj.licenceID + "\" data-tooltip=\"View Licence\">" +
              cityssm.escapeHTML(licenceObj.externalLicenceNumber) + "<br />" +
              "<small>Licence #" + licenceObj.licenceID + "</small>" +
              "</a>" +
              "</td>") +
            ("<td>" +
              (exports.config_licenceTypes[licenceObj.licenceTypeKey] || licenceObj.licenceTypeKey) +
              "</td>") +
            ("<td>" +
            "<a href=\"/organizations/" + licenceObj.organizationID + "\" data-tooltip=\"View Organization\">" +
              cityssm.escapeHTML(licenceObj.organizationName) +
              "</a>" +
              "</td>") +
            ("<td>" +
            "<a href=\"/locations/" + licenceObj.locationID + "\" data-tooltip=\"View Location\">" +
              cityssm.escapeHTML(licenceObj.locationDisplayName) +
              "</a>" +
              (licenceObj.locationDisplayName === licenceObj.locationName ?
                "<br /><small>" + cityssm.escapeHTML(licenceObj.locationAddress1) + "</small>" :
                "") +
              "</td>") +
            ("<td class=\"is-nowrap\">" + licenceObj.issueDateString + "</td>") +
            ("<td class=\"is-nowrap\">" +
              "<span class=\"icon\"><i class=\"fas fa-play\" aria-hidden=\"true\"></i></span> " +
              licenceObj.startDateString +
              "</td>") +
            ("<td class=\"is-nowrap\">" +
              "<span class=\"icon\"><i class=\"fas fa-stop\" aria-hidden=\"true\"></i></span> " +
              licenceObj.endDateString +
              "</td>");

          tbodyEle.insertAdjacentElement("beforeend", trEle);

        }

        tableEle.insertAdjacentElement("beforeend", tbodyEle);

        cityssm.clearElement(containerEle);

        containerEle.insertAdjacentElement("beforeend", tableEle);

      }
    );

  }


  llm.initializeDateRangeSelector(
    document.querySelector(".is-date-range-selector[data-field-key='startEndDate']"),
    getActiveLicenceSummary
  );

  llm.getDefaultConfigProperty("externalLicenceNumber_fieldLabel", function(fieldLabel) {

    externalLicenceNumberFieldLabel = fieldLabel;
    getActiveLicenceSummary();

  });

}());
