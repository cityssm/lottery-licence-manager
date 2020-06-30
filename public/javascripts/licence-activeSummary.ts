import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";
import * as llmTypes from "../../helpers/llmTypes";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


(() => {

  let externalLicenceNumberFieldLabel = "";

  const formEle = document.getElementById("form--activeSummary");
  const containerEle = document.getElementById("container--activeSummary");

  const getActiveLicenceSummaryFn = () => {

    containerEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading licences...</em>" +
      "</p>";

    cityssm.postJSON(
      "/licences/doGetActiveLicenceSummary", formEle,
      (activeLicenceList: llmTypes.LotteryLicence[]) => {

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

        for (const licenceObj of activeLicenceList) {

          const trEle = document.createElement("tr");

          trEle.innerHTML = ("<td>" +
            "<a href=\"/licences/" + licenceObj.licenceID.toString() + "\" data-tooltip=\"View Licence\">" +
            cityssm.escapeHTML(licenceObj.externalLicenceNumber) + "<br />" +
            "<small>Licence #" + licenceObj.licenceID.toString() + "</small>" +
            "</a>" +
            "</td>") +
            ("<td>" +
              (<string>exports.config_licenceTypes[licenceObj.licenceTypeKey] || licenceObj.licenceTypeKey) +
              "</td>") +
            ("<td>" +
              "<a href=\"/organizations/" + licenceObj.organizationID.toString() + "\"" +
              " data-tooltip=\"View Organization\">" +
              cityssm.escapeHTML(licenceObj.organizationName) +
              "</a>" +
              "</td>") +
            ("<td>" +
              "<a href=\"/locations/" + licenceObj.locationID.toString() + "\" data-tooltip=\"View Location\">" +
              cityssm.escapeHTML(licenceObj.locationDisplayName) +
              "</a>" +
              (licenceObj.locationDisplayName === licenceObj.locationName
                ? "<br /><small>" + cityssm.escapeHTML(licenceObj.locationAddress1) + "</small>"
                : "") +
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
  };


  llm.initializeDateRangeSelector(
    document.querySelector(".is-date-range-selector[data-field-key='startEndDate']"),
    getActiveLicenceSummaryFn
  );

  llm.getDefaultConfigProperty("externalLicenceNumber_fieldLabel", (fieldLabel: string) => {
    externalLicenceNumberFieldLabel = fieldLabel;
    getActiveLicenceSummaryFn();
  });
})();
