import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;

import type { llmGlobal } from "./types";
declare const llm: llmGlobal;


(function() {

  const formEle = document.getElementById("form--licenceTypes");
  const containerEle = document.getElementById("container--licenceTypes");

  let externalLicenceNumberLabel = "";

  function getLicenceTypeSummary() {

    cityssm.clearElement(containerEle);

    containerEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading report...</em>" +
      "</p>";

    cityssm.postJSON("/licences/doGetLicenceTypeSummary", formEle, function(licenceList) {

      cityssm.clearElement(containerEle);

      if (licenceList.length === 0) {

        containerEle.innerHTML = "<div class=\"message is-info\">" +
          "<p class=\"message-body\">There are no licences available that meet your search criteria.</p>" +
          "</div>";

        return;

      }

      const tableEle = document.createElement("table");
      tableEle.className = "table is-fullwidth is-striped is-hoverable";

      tableEle.innerHTML = "<thead><tr>" +
        "<th>Application Date</th>" +
        "<th>Issue Date</th>" +
        "<th>" + externalLicenceNumberLabel + "</th>" +
        "<th>Organization</th>" +
        "<th>Location</th>" +
        "<th class=\"has-text-right\">Prize Value</th>" +
        "<th class=\"has-text-right\">Licence Fee</th>" +
        "</tr></thead>";

      const tbodyEle = document.createElement("tbody");

      let issueDateCount = 0;
      let totalPrizeValueSum = 0;
      let licenceFeeSum = 0;
      let transactionAmountSum = 0;

      for (let licenceIndex = 0; licenceIndex < licenceList.length; licenceIndex += 1) {

        const licenceObj = licenceList[licenceIndex];

        const trEle = document.createElement("tr");

        trEle.insertAdjacentHTML(
          "beforeend",
          "<td>" + licenceObj.applicationDateString + "</td>"
        );

        trEle.insertAdjacentHTML(
          "beforeend",
          "<td>" + licenceObj.issueDateString + "</td>"
        );

        trEle.insertAdjacentHTML(
          "beforeend",
          "<td>" +
          "<a data-tooltip=\"View Licence\" href=\"/licences/" + licenceObj.licenceID + "\">" +
          cityssm.escapeHTML(licenceObj.externalLicenceNumber) + "<br />" +
          "<small>Licence #" + licenceObj.licenceID + "</small>" +
          "</a>" +
          "</td>"
        );

        trEle.insertAdjacentHTML(
          "beforeend",
          "<td>" + cityssm.escapeHTML(licenceObj.organizationName) + "</td>"
        );

        trEle.insertAdjacentHTML(
          "beforeend",
          "<td>" + cityssm.escapeHTML(licenceObj.locationDisplayName) + "</td>"
        );

        trEle.insertAdjacentHTML(
          "beforeend",
          "<td class=\"is-nowrap has-text-right\">$ " + licenceObj.totalPrizeValue.toFixed(2) + "</td>"
        );

        trEle.insertAdjacentHTML(
          "beforeend",
          "<td class=\"is-nowrap has-text-right\">$ " + licenceObj.licenceFee.toFixed(2) + "</td>"
        );


        tbodyEle.insertAdjacentElement("beforeend", trEle);

        // Update summaries

        if (licenceObj.issueDate && licenceObj.issueDate > 0) {

          issueDateCount += 1;

        }

        totalPrizeValueSum += licenceObj.totalPrizeValue;
        licenceFeeSum += licenceObj.licenceFee;
        transactionAmountSum += licenceObj.transactionAmountSum;

      }

      tableEle.insertAdjacentElement("beforeend", tbodyEle);

      const tfootEle = document.createElement("tfoot");

      tfootEle.innerHTML = "<tr>" +
        "<th>" +
        licenceList.length + " licence" + (licenceList.length === 1 ? "" : "s") +
        "</th>" +
        "<th>" +
        issueDateCount + " issued" +
        "</th>" +
        "<td></td>" +
        "<td></td>" +
        "<td></td>" +
        "<th class=\"is-nowrap has-text-right\">$ " + totalPrizeValueSum.toFixed(2) + "</th>" +
        "<th class=\"is-nowrap has-text-right\">$ " + licenceFeeSum.toFixed(2) + "</th>" +
        "</tr>";

      tableEle.insertAdjacentElement("beforeend", tfootEle);

      containerEle.insertAdjacentElement("beforeend", tableEle);

    });

  }

  llm.getDefaultConfigProperty("externalLicenceNumber_fieldLabel", function(fieldLabel) {

    externalLicenceNumberLabel = fieldLabel;
    getLicenceTypeSummary();

  });


  llm.initializeDateRangeSelector(
    document.querySelector(".is-date-range-selector[data-field-key='applicationDate']"),
    getLicenceTypeSummary
  );


  document.getElementById("filter--licenceTypeKey").addEventListener("change", getLicenceTypeSummary);

}());