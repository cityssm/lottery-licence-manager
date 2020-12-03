import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


(() => {

  const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");

  const formEle = document.getElementById("form--licenceTypes");
  const containerEle = document.getElementById("container--licenceTypes");

  let externalLicenceNumberLabel = "";

  const getLicenceTypeSummaryFn = () => {

    cityssm.clearElement(containerEle);

    containerEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading report...</em>" +
      "</p>";

    cityssm.postJSON(urlPrefix + "/licences/doGetLicenceTypeSummary", formEle,
      (licenceList: Array<{
        licenceID: number;
        externalLicenceNumber: string;
        applicationDateString: string;
        organizationName: string;
        locationDisplayName: string;
        totalPrizeValue: number;
        licenceFee: number;
        issueDate: number;
        issueDateString: string;
      }>) => {

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
        // let transactionAmountSum = 0;

        for (const licenceObj of licenceList) {

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
            "<a data-tooltip=\"View Licence\" href=\"" + cityssm.escapeHTML(urlPrefix) + "/licences/" + licenceObj.licenceID.toString() + "\">" +
            cityssm.escapeHTML(licenceObj.externalLicenceNumber) + "<br />" +
            "<small>Licence #" + licenceObj.licenceID.toString() + "</small>" +
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
          // transactionAmountSum += licenceObj.transactionAmountSum;
        }

        tableEle.insertAdjacentElement("beforeend", tbodyEle);

        const tfootEle = document.createElement("tfoot");

        tfootEle.innerHTML = "<tr>" +
          "<th>" +
          licenceList.length.toString() + " licence" + (licenceList.length === 1 ? "" : "s") +
          "</th>" +
          "<th>" +
          issueDateCount.toString() + " issued" +
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
  };

  llm.initializeDateRangeSelector(
    document.querySelector(".is-date-range-selector[data-field-key='applicationDate']"),
    getLicenceTypeSummaryFn
  );

  document.getElementById("filter--licenceTypeKey").addEventListener("change", getLicenceTypeSummaryFn);

  llm.getDefaultConfigProperty("externalLicenceNumber_fieldLabel", (fieldLabel: string) => {
    externalLicenceNumberLabel = fieldLabel;
    getLicenceTypeSummaryFn();
  });

})();
