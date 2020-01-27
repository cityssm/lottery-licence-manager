"use strict";

(function() {

  const formEle = document.getElementById("form--licenceTypes");
  const containerEle = document.getElementById("container--licenceTypes");

  let externalLicenceNumberLabel = "";

  function getLicenceTypeSummary() {

    llm.clearElement(containerEle);

    containerEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading report...</em>" +
      "</p>";

    llm.postJSON("/licences/doGetLicenceTypeSummary", formEle, function(licenceList) {

      llm.clearElement(containerEle);

      if (licenceList.length === 0) {

        containerEle.innerHTML = "<div class=\"message is-info\">" +
          "<p class=\"message-body\">There are no licences available that meet your search criteria.</p>" +
          "</div>";

        return;

      }

      const tableEle = document.createElement("table");
      tableEle.className = "table is-fullwidth";

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
          "<a href=\"/licences/" + licenceObj.licenceID + "\">" +
          llm.escapeHTML(licenceObj.externalLicenceNumber) + "<br />" +
          "<small>Licence #" + licenceObj.licenceID + "</small>" +
          "</a>" +
          "</td>"
        );

        trEle.insertAdjacentHTML(
          "beforeend",
          "<td>" + llm.escapeHTML(licenceObj.organizationName) + "</td>"
        );

        trEle.insertAdjacentHTML(
          "beforeend",
          "<td>" + llm.escapeHTML(licenceObj.locationDisplayName) + "</td>"
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


  const inputEles = formEle.querySelectorAll("input, select");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {

    inputEles[inputIndex].addEventListener("change", getLicenceTypeSummary);

  }

}());
