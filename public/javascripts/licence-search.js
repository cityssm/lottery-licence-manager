/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  let licenceType_keyToName = {};

  const formEle = document.getElementById("form--filters");
  const searchResultsEle = document.getElementById("container--searchResults");

  const externalLicenceNumberLabel = searchResultsEle.getAttribute("data-external-licence-number-label");

  const canUpdate = searchResultsEle.getAttribute("data-can-update") === "true";


  function doLicenceSearch() {

    searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading licences..." +
      "</p>";

    window.fetch("/licences/doSearch", {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEle))
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(licenceList) {

        if (licenceList.length === 0) {

          searchResultsEle.innerHTML = "<div class=\"message is-info\">" +
            "<div class=\"message-body\">" +
            "<strong>Your search returned no results.</strong><br />" +
            "Please try expanding your search criteria." +
            "</div>" +
            "</div>";

          return;

        } else {
          searchResultsEle.innerHTML = "<table class=\"table is-fullwidth is-striped is-hoverable\">" +
            "<thead><tr>" +
            "<th>" + externalLicenceNumberLabel + "</th>" +
            "<th>Organization Name</th>" +
            "<th>Licence</th>" +
            "<th>Dates</th>" +
            "<th><span class=\"sr-only\">Options</span></th>" +
            "</tr></thead>" +
            "<tbody></tbody>" +
            "</table>";

          const tbodyEle = searchResultsEle.getElementsByTagName("tbody")[0];

          for (let licenceIndex = 0; licenceIndex < licenceList.length; licenceIndex += 1) {

            const licenceObj = licenceList[licenceIndex];
            const licenceType = licenceType_keyToName[licenceObj.LicenceTypeKey];

            const trEle = document.createElement("tr");

            trEle.innerHTML =
              "<td>" +
              "<a href=\"/licences/" + licenceObj.LicenceID + "\">" +
              window.llm.escapeHTML(licenceObj.ExternalLicenceNumber) + "<br />" +
              "<small>Licence #" + licenceObj.LicenceID + "</small>" +
              "</a>" +
              "</td>" +
              "<td>" + window.llm.escapeHTML(licenceObj.OrganizationName) + "</td>" +
              "<td>" + (licenceType || licenceObj.LicenceTypeKey) + "<br />" +
              "<small>" + window.llm.escapeHTML(licenceObj.LicenceDetails) + "</small>" +
              "</td>" +

              ("<td>" +
                "<span class=\"has-tooltip-right\" data-tooltip=\"Start Date\"><i class=\"fas fa-fw fa-play\" aria-hidden=\"true\"></i> " + licenceObj.StartDateString + "</span><br />" +
                "<span class=\"has-tooltip-right\" data-tooltip=\"End Date\"><i class=\"fas fa-fw fa-stop\" aria-hidden=\"true\"></i> " + licenceObj.EndDateString + "</span>" +
                "</td>") +

              "<td class=\"has-text-right\">" +

              (canUpdate ?

                "<a class=\"button is-small\" data-tooltip=\"Edit Licence\" href=\"/licences/" + licenceObj.LicenceID + "/edit\">" +
                "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                "<span>Edit</span>" +
                "</a> " : "") +
              (licenceObj.LicenceFeeIsPaid ?

                "<a class=\"button is-small\" data-tooltip=\"Print Licence\" href=\"/licences/" + licenceObj.LicenceID + "/print\" target=\"_blank\">" +
                "<i class=\"fas fa-print\" aria-hidden=\"true\"></i>" +
                "<span class=\"sr-only\">Print</span>" +
                "</a>" :
              "<span class=\"tag is-warning\">Unpaid</span>") +
              "</div>" +

              "</td>";

            tbodyEle.insertAdjacentElement("beforeend", trEle);
          }
        }
      });
  }


  const licenceTypeOptionEles = document.getElementById("filter--licenceTypeKey").getElementsByTagName("option");

  // start at 1 to skip the blank first record
  for (let optionIndex = 1; optionIndex < licenceTypeOptionEles.length; optionIndex += 1) {
    const optionEle = licenceTypeOptionEles[optionIndex];
    licenceType_keyToName[optionEle.value] = optionEle.innerText;
  }


  formEle.addEventListener("submit", function(formEvent) {
    formEvent.preventDefault();
  });

  const inputEles = formEle.querySelectorAll(".input, .select select");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
    inputEles[inputIndex].addEventListener("change", doLicenceSearch);
  }

  doLicenceSearch();
}());
