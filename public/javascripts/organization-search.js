/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  const formEle = document.getElementById("form--filters");
  const searchResultsEle = document.getElementById("container--searchResults");

  const canCreate = document.getElementsByTagName("main")[0].getAttribute("data-can-create") === "true";


  function doOrganizationSearch() {

    searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading organizations...</em>" +
      "</p>";

    window.fetch("/organizations/doSearch", {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEle))
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(organizationsList) {

        if (organizationsList.length === 0) {

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
            "<th colspan=\"" + (canCreate ? "3" : "2") + "\">Organization</th>" +
            "<th" + (canCreate ? " colspan=\"2\"" : "") + ">Licences</th>" +
            "</tr></thead>" +
            "<tbody></tbody>" +
            "</table>";

          const tbodyEle = searchResultsEle.getElementsByTagName("tbody")[0];

          for (let organizationIndex = 0; organizationIndex < organizationsList.length; organizationIndex += 1) {

            const organizationObj = organizationsList[organizationIndex];

            const trEle = document.createElement("tr");
            trEle.innerHTML = "<td></td>";

            const organizationNameLinkEle = document.createElement("a");

            if (!organizationObj.isEligibleForLicences) {
              organizationNameLinkEle.className = "has-text-danger";
              organizationNameLinkEle.setAttribute("data-tooltip", "Not Eligible for New Licences");
            }

            organizationNameLinkEle.innerText = organizationObj.organizationName;
            organizationNameLinkEle.href = "/organizations/" + organizationObj.organizationID;
            trEle.getElementsByTagName("td")[0].insertAdjacentElement("beforeend", organizationNameLinkEle);

            trEle.insertAdjacentHTML("beforeend",
              "<td class=\"has-text-right\">" +
              (organizationObj.organizationNote === "" ?
                "" :
                "<span class=\"tag has-cursor-default is-info is-light\" data-tooltip=\"Organization Has Note\">" +
                "<i class=\"fas fa-sticky-note has-margin-right-5\" aria-hidden=\"true\"></i> Note" +
                "</span>"
              ) +
              "</td>");

            if (canCreate) {
              trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
                (organizationObj.canUpdate ?
                  "<a class=\"button is-small\" data-tooltip=\"Edit Organization\" href=\"/organizations/" + organizationObj.organizationID + "/edit\">" +
                  "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                  "<span>Edit</span>" +
                  "</a>" :
                  "") +
                "</td>");
            }

            let licenceHTML = "";

            if (organizationObj.licences_activeCount > 0) {

              licenceHTML = "<span class=\"tag has-cursor-default is-info\" data-tooltip=\"Number of Active Licences\">" +
                "<i class=\"fas fa-certificate has-margin-right-5\" aria-hidden=\"true\"></i> " + organizationObj.licences_activeCount +
                "</span>";

            } else if (organizationObj.licences_endDateMax) {

              licenceHTML = "<span class=\"tag has-cursor-default is-info is-light\" data-tooltip=\"Last Licence End Date\">" +
                "<i class=\"fas fa-stop has-margin-right-5\" aria-hidden=\"true\"></i> " + organizationObj.licences_endDateMaxString +
                "</span>";
            }


            trEle.insertAdjacentHTML("beforeend", "<td>" + licenceHTML + "</td>");

            if (canCreate) {

              trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
                (organizationObj.isEligibleForLicences ?
                  "<a class=\"button is-small\" data-tooltip=\"Create a New Licence\" href=\"/licences/new/" + organizationObj.organizationID + "\">" +
                  "<span class=\"icon\"><i class=\"fas fa-certificate\" aria-hidden=\"true\"></i></span>" +
                  "<span>New</span>" +
                  "</a>" : "") +
                "</td>");
            }

            tbodyEle.insertAdjacentElement("beforeend", trEle);
          }
        }

      });
  }


  formEle.addEventListener("submit", function(formEvent) {
    formEvent.preventDefault();
  });

  const inputEles = formEle.querySelectorAll(".input, .select");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
    inputEles[inputIndex].addEventListener("change", doOrganizationSearch);
  }

  doOrganizationSearch();
}());
