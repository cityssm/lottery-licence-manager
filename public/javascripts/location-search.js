/* global window, document */


(function() {
  "use strict";

  const searchStrEle = document.getElementById("filter--locationNameAddress");
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

      searchResultsEle.innerHTML = "<table class=\"table is-fullwidth is-striped is-hoverable\">" +
        "<thead><tr>" +
        "<th>Location</th>" +
        "<th>Address</th>" +
        "</tr></thead>" +
        "<tbody></tbody>" +
        "</table>";

      const tbodyEle = searchResultsEle.getElementsByTagName("tbody")[0];

      for (let locationIndex = 0; locationIndex < locationsList.length; locationIndex += 1) {

        const locationObj = locationsList[locationIndex];

        let doDisplay = true;

        const searchStrSplit = searchStrEle.value.trim().toLowerCase().split(" ");

        for (let searchStrIndex = 0; searchStrIndex < searchStrSplit.length; searchStrIndex += 1) {
          const searchStrPiece = searchStrSplit[searchStrIndex];

          if (locationObj.locationName.toLowerCase().indexOf(searchStrPiece) === -1 &&
            locationObj.locationAddress1.toLowerCase().indexOf(searchStrPiece) === -1 &&
            locationObj.locationAddress2.toLowerCase().indexOf(searchStrPiece) === -1) {
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

        locationDisplayNameLinkEle.innerText = (locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName);
        locationDisplayNameLinkEle.href = "/locations/" + locationObj.locationID;
        trEle.getElementsByTagName("td")[0].insertAdjacentElement("beforeend", locationDisplayNameLinkEle);

        tbodyEle.insertAdjacentElement("beforeend", trEle);

        // address

        const addressTdEle = document.createElement("td");
        addressTdEle.innerHTML = window.llm.escapeHTML(locationObj.locationAddress1) + "<br />" +
          "<small>" + window.llm.escapeHTML(locationObj.locationAddress2) + "</small>";

        trEle.insertAdjacentElement("beforeend", addressTdEle);

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


  document.getElementById("form--filters").addEventListener("submit", function(formEvent) {
    formEvent.preventDefault();
  });

  searchStrEle.addEventListener("keyup", filterLocations);

}());
