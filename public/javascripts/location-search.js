/* global window, document */


(function() {
  "use strict";

  const searchStrEle = document.getElementById("filter--locationNameAddress");
  const locationIsDistributorEle = document.getElementById("filter--locationIsDistributor");
  const locationIsManufacturerEle = document.getElementById("filter--locationIsManufacturer");

  const searchResultsEle = document.getElementById("container--searchResults");

  let locationsList = [];

  function filterLocations() {

    if (locationsList.length === 0) {

      searchResultsEle.innerHTML = "<div class=\"message is-info\">" +
        "<div class=\"message-body\">" +
        "<strong>There are no locations on record.</strong>" +
        "</div>" +
        "</div>";

      return;

    } else {

      let displayLimit = 50;

      const locationIsDistributorValue = locationIsDistributorEle.value;
      const locationIsManufacturerValue = locationIsManufacturerEle.value;

      searchResultsEle.innerHTML = "<table class=\"table is-fullwidth is-striped is-hoverable\">" +
        "<thead><tr>" +
        "<th>Location</th>" +
        "<th>Address</th>" +
        "<th class=\"has-text-centered\">Licences</th>" +
        "<th class=\"has-text-centered\">Distributor</th>" +
        "<th class=\"has-text-centered\">Manufacturer</th>" +
        "</tr></thead>" +
        "<tbody></tbody>" +
        "</table>";

      const tbodyEle = searchResultsEle.getElementsByTagName("tbody")[0];

      for (let locationIndex = 0; locationIndex < locationsList.length; locationIndex += 1) {

        const locationObj = locationsList[locationIndex];

        let doDisplay = true;

        if (locationIsDistributorValue !== "") {
          if (parseInt(locationIsDistributorValue) !== locationObj.locationIsDistributor) {
            doDisplay = false;
            continue;
          }
        }

        if (locationIsManufacturerValue !== "") {
          if (parseInt(locationIsManufacturerValue) !== locationObj.locationIsManufacturer) {
            doDisplay = false;
            continue;
          }
        }

        const searchStrSplit = searchStrEle.value.trim().toLowerCase().split(" ");

        for (let searchStrIndex = 0; searchStrIndex < searchStrSplit.length; searchStrIndex += 1) {
          const searchStrPiece = searchStrSplit[searchStrIndex];

          if (locationObj.locationName.toLowerCase().indexOf(searchStrPiece) === -1 &&
            locationObj.locationAddress1.toLowerCase().indexOf(searchStrPiece) === -1 &&
            locationObj.locationAddress2.toLowerCase().indexOf(searchStrPiece) === -1 &&
            locationObj.locationCity.toLowerCase().indexOf(searchStrPiece) === -1) {
            doDisplay = false;
            break;
          }
        }

        if (!doDisplay) {
          continue;
        }

        displayLimit -= 1;

        const trEle = document.createElement("tr");
        trEle.innerHTML = "<td></td>";

        const locationDisplayNameLinkEle = document.createElement("a");

        locationDisplayNameLinkEle.innerText = locationObj.locationDisplayName;
        locationDisplayNameLinkEle.href = "/locations/" + locationObj.locationID;
        trEle.getElementsByTagName("td")[0].insertAdjacentElement("beforeend", locationDisplayNameLinkEle);

        tbodyEle.insertAdjacentElement("beforeend", trEle);

        // address

        const addressTdEle = document.createElement("td");
        addressTdEle.innerHTML = window.llm.escapeHTML(locationObj.locationAddress1) +
        (locationObj.locationAddress2 === "" ? "" : "<br /><small>" + window.llm.escapeHTML(locationObj.locationAddress2) + "</small>") +
        (locationObj.locationCity === "" ? "" : "<br /><small>" + window.llm.escapeHTML(locationObj.locationCity) + ", " + locationObj.locationProvince + "</small>");

        trEle.insertAdjacentElement("beforeend", addressTdEle);


        trEle.insertAdjacentHTML("beforeend",
          "<td class=\"has-text-centered\">" +
          (locationObj.licences_endDateMaxString === "" ?
            "<span class=\"has-text-grey\">Not Used</span>" :
            locationObj.licences_endDateMaxString) +
          "</td>");


        trEle.insertAdjacentHTML("beforeend",
          "<td class=\"has-text-centered\">" +
          (locationObj.locationIsDistributor ?
            "<span data-tooltip=\"Distributor\">" +
            "<span class=\"tag is-success\">Yes</span><br />" +
            (locationObj.distributor_endDateMaxString === "" ? "<span class=\"has-text-grey\">Never Used</span>" : locationObj.distributor_endDateMaxString) +
            "</span>" :
            "<span class=\"sr-only\">No</span>"
          ) +
          "</td>");


        trEle.insertAdjacentHTML("beforeend",
          "<td class=\"has-text-centered\">" +
          (locationObj.locationIsManufacturer ?
            "<span data-tooltip=\"Manufacturer\">" +
            "<span class=\"tag is-success\">Yes</span><br />" +
            (locationObj.manufacturer_endDateMaxString === "" ? "<span class=\"has-text-grey\">Never Used</span>" : locationObj.manufacturer_endDateMaxString) +
            "</span>" :
            "<span class=\"sr-only\">No</span>"
          ) +
          "</td>");


        if (displayLimit === 0) {
          break;
        }
      }

      if (displayLimit === 0) {
        searchResultsEle.insertAdjacentHTML("beforeend", "<div class=\"message is-warning\">" +
          "<p class=\"message-body\">Display Limit Reached</p>" +
          "</div>");
      }
    }
  }


  window.fetch("/locations/doGetLocations", {
      method: "POST",
      credentials: "include"
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(locationsListResponse) {
      locationsList = locationsListResponse;
      filterLocations();
    });


  searchStrEle.addEventListener("keyup", filterLocations);
  locationIsDistributorEle.addEventListener("change", filterLocations);
  locationIsManufacturerEle.addEventListener("change", filterLocations);

}());
