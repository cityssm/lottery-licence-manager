/* global window, document */

"use strict";

(function() {

  const searchStrEle = document.getElementById("filter--locationNameAddress");
  const locationIsDistributorEle = document.getElementById("filter--locationIsDistributor");
  const locationIsManufacturerEle = document.getElementById("filter--locationIsManufacturer");

  const searchResultsEle = document.getElementById("container--searchResults");

  const canCreate = document.getElementsByTagName("main")[0].getAttribute("data-can-create") === "true";

  let locationsList = [];

  let filterLocations;


  function clickFn_deleteLocation(clickEvent) {

    clickEvent.preventDefault();

    const locationIndex = parseInt(clickEvent.currentTarget.getAttribute("data-location-index"));
    const locationObj = locationsList[locationIndex];

    const deleteFn = function() {

      window.fetch("/locations/doDelete", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            locationID: locationObj.locationID
          })
        })
        .then(function(response) {

          return response.json();

        })
        .then(function(responseJSON) {

          if (responseJSON.success) {

            locationsList.splice(locationIndex, 1);
            filterLocations();

          }

        });

    };


    window.llm.confirmModal("Delete Location",
      `Are you sure you want to delete ${window.llm.escapeHTML(locationObj.locationDisplayName)}?`,
      "Yes, Delete",
      "warning",
      deleteFn
    );

  }


  filterLocations = function() {

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
        (canCreate ? "<th class=\"is-hidden-print\"><span class=\"sr-only\">Options</span></th>" : "") +
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


        if (canCreate) {

          const canDeleteLocation = locationObj.canUpdate && locationObj.licences_count === 0 && locationObj.distributor_count === 0 && locationObj.manufacturer_count === 0;

          trEle.insertAdjacentHTML("beforeend",
            "<td class=\"is-hidden-print\">" +
            "<div class=\"buttons justify-flex-end\">" +

            (locationObj.canUpdate ?
              `<a class="button is-small" href="/locations/${locationObj.locationID}/edit"><span class="icon"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span> <span>Edit</span></a>` :
              "") +

            (canDeleteLocation ?
              `<button class="button is-small is-danger is-delete-location-button" data-location-index="${locationIndex}"><span class="icon"><i class="fas fa-trash" aria-hidden="true"></i></span></button>` :
              "") +

            "</div>" +

            "</td>");

          if (canDeleteLocation) {

            trEle.getElementsByClassName("is-delete-location-button")[0].addEventListener("click", clickFn_deleteLocation);

          }

        }


        tbodyEle.insertAdjacentElement("beforeend", trEle);


        if (displayLimit === 0) {

          break;

        }

      }

      if (displayLimit === 0) {

        searchResultsEle.insertAdjacentHTML("beforeend",
          "<div class=\"message is-warning\">" +
          "<p class=\"message-body\">Display Limit Reached</p>" +
          "</div>");

      }

    }

  };


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
