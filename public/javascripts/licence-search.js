"use strict";

(function() {

  let licenceType_keyToName = {};

  const formEle = document.getElementById("form--filters");

  const limitEle = document.getElementById("filter--limit");
  const offsetEle = document.getElementById("filter--offset");

  const searchResultsEle = document.getElementById("container--searchResults");

  const externalLicenceNumberLabel = searchResultsEle.getAttribute("data-external-licence-number-label");


  function doLicenceSearch() {

    const currentLimit = parseInt(limitEle.value);
    const currentOffset = parseInt(offsetEle.value);

    searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading licences...</em>" +
      "</p>";

    llm.postJSON(
      "/licences/doSearch",
      formEle,
      function(licenceResults) {

        const licenceList = licenceResults.licences;

        if (licenceList.length === 0) {

          searchResultsEle.innerHTML = "<div class=\"message is-info\">" +
            "<div class=\"message-body\">" +
            "<strong>Your search returned no results.</strong><br />" +
            "Please try expanding your search criteria." +
            "</div>" +
            "</div>";

        } else {

          searchResultsEle.innerHTML = "<table class=\"table is-fullwidth is-striped is-hoverable\">" +
            "<thead><tr>" +
            "<th>" + externalLicenceNumberLabel + "</th>" +
            "<th>Licence</th>" +
            "<th>Organization Name</th>" +
            "<th>Location</th>" +
            "<th>Dates</th>" +
            "<th class=\"is-hidden-print\"><span class=\"sr-only\">Options</span></th>" +
            "</tr></thead>" +
            "<tbody></tbody>" +
            "</table>";

          const tbodyEle = searchResultsEle.getElementsByTagName("tbody")[0];

          for (let licenceIndex = 0; licenceIndex < licenceList.length; licenceIndex += 1) {

            const licenceObj = licenceList[licenceIndex];
            const licenceType = licenceType_keyToName[licenceObj.licenceTypeKey];

            const trEle = document.createElement("tr");

            trEle.innerHTML =
              "<td>" +
              "<a href=\"/licences/" + licenceObj.licenceID + "\">" +
              llm.escapeHTML(licenceObj.externalLicenceNumber) + "<br />" +
              "<small>Licence #" + licenceObj.licenceID + "</small>" +
              "</a>" +
              "</td>" +
              "<td>" + (licenceType || licenceObj.licenceTypeKey) + "<br />" +
              "<small>" + llm.escapeHTML(licenceObj.licenceDetails) + "</small>" +
              "</td>" +

              ("<td>" +
                "<a href=\"/organizations/" + licenceObj.organizationID + "\">" +
                llm.escapeHTML(licenceObj.organizationName) +
                "</a>" +
                "</td>") +

              ("<td>" +
                "<a href=\"/locations/" + licenceObj.locationID + "\">" +
                llm.escapeHTML(licenceObj.locationDisplayName) +
                "</a>" +
                (licenceObj.locationDisplayName === licenceObj.locationAddress1 ? "" : "<br /><small>" + llm.escapeHTML(licenceObj.locationAddress1) + "</small>") +
                "</td>") +

              ("<td class=\"is-nowrap\">" +
                "<span class=\"has-cursor-default has-tooltip-right\" data-tooltip=\"Start Date\">" +
                "<i class=\"fas fa-fw fa-play\" aria-hidden=\"true\"></i> " + licenceObj.startDateString +
                "</span><br />" +
                "<span class=\"has-cursor-default has-tooltip-right\" data-tooltip=\"End Date\">" +
                "<i class=\"fas fa-fw fa-stop\" aria-hidden=\"true\"></i> " + licenceObj.endDateString +
                "</span>" +
                "</td>") +

              "<td class=\"has-text-right is-nowrap is-hidden-print\">" +

              (licenceObj.canUpdate ?
                "<a class=\"button is-small\" data-tooltip=\"Edit Licence\" href=\"/licences/" + licenceObj.licenceID + "/edit\">" +
                "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                "<span>Edit</span>" +
                "</a> " : "") +

              (licenceObj.issueDate ?
                "<a class=\"button is-small\" data-tooltip=\"Print Licence\" href=\"/licences/" + licenceObj.licenceID + "/print\" target=\"_blank\" download>" +
                "<i class=\"fas fa-print\" aria-hidden=\"true\"></i>" +
                "<span class=\"sr-only\">Print</span>" +
                "</a>" :
                "<span class=\"tag is-warning\">Not Issued</span>") +
              "</div>" +

              "</td>";

            tbodyEle.insertAdjacentElement("beforeend", trEle);

          }

          searchResultsEle.insertAdjacentHTML("beforeend", "<div class=\"level\">" +
            "<div class=\"level-left has-text-weight-bold\">" +
            "Displaying licences " +
            (currentOffset + 1) +
            " to " +
            Math.min(currentLimit + currentOffset, licenceResults.count) +
            " of " +
            licenceResults.count +
            "</div>" +
            "</div>");

          if (currentLimit < licenceResults.count) {

            const paginationEle = document.createElement("nav");
            paginationEle.className = "level-right";
            paginationEle.setAttribute("role", "pagination");
            paginationEle.setAttribute("aria-label", "pagination");

            if (currentOffset > 0) {

              const previousEle = document.createElement("a");
              previousEle.className = "button";
              previousEle.innerText = "Previous";
              previousEle.addEventListener("click", function(clickEvent) {

                clickEvent.preventDefault();
                offsetEle.value = Math.max(0, currentOffset - currentLimit);
                doLicenceSearch();

              });

              paginationEle.insertAdjacentElement("beforeend", previousEle);

            }

            if (currentLimit + currentOffset < licenceResults.count) {

              const nextEle = document.createElement("a");
              nextEle.className = "button has-margin-left-10";
              nextEle.innerHTML = "<span>Next Licences</span><span class=\"icon\"><i class=\"fas fa-chevron-right\" aria-hidden=\"true\"></i></span>";
              nextEle.addEventListener("click", function(clickEvent) {

                clickEvent.preventDefault();
                offsetEle.value = (currentOffset + currentLimit);
                doLicenceSearch();

              });

              paginationEle.insertAdjacentElement("beforeend", nextEle);

            }

            searchResultsEle.getElementsByClassName("level")[0].insertAdjacentElement("beforeend", paginationEle);

          }

        }

      }
    );

  }


  function resetOffsetAndDoLicenceSearch() {

    offsetEle.value = 0;
    doLicenceSearch();

  }

  const licenceTypeOptionEles = document.getElementById("filter--licenceTypeKey").getElementsByTagName("option");

  // Start at 1 to skip the blank first record
  for (let optionIndex = 1; optionIndex < licenceTypeOptionEles.length; optionIndex += 1) {

    const optionEle = licenceTypeOptionEles[optionIndex];
    licenceType_keyToName[optionEle.value] = optionEle.innerText;

  }


  formEle.addEventListener("submit", function(formEvent) {

    formEvent.preventDefault();

  });

  const inputEles = formEle.querySelectorAll(".input, .select select");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {

    inputEles[inputIndex].addEventListener("change", resetOffsetAndDoLicenceSearch);

  }

  resetOffsetAndDoLicenceSearch();

}());
