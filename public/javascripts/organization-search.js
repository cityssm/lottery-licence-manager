/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  const formEle = document.getElementById("form--filters");
  const searchResultsEle = document.getElementById("container--searchResults");

  const canEdit = searchResultsEle.getAttribute("data-can-edit") === "true";


  function doOrganizationSearch() {

    searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\"></i><br />" +
      "<em>Loading organizations..." +
      "</p>";

    window.fetch("/organizations/doSearch", {
        method: "post",
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
            "<th>Organization Name</th>" +
            "<th>&nbsp;</th>" +
            "</tr></thead>" +
            "<tbody></tbody>" +
            "</table>";

          const tbodyEle = searchResultsEle.getElementsByTagName("tbody")[0];

          for (let organizationIndex = 0; organizationIndex < organizationsList.length; organizationIndex += 1) {

            const organizationObj = organizationsList[organizationIndex];

            const trEle = document.createElement("tr");
            trEle.innerHTML = "<td></td>";

            const organizationNameLinkEle = document.createElement("a");
            organizationNameLinkEle.innerText = organizationObj.OrganizationName;
            organizationNameLinkEle.href = "/organizations/" + organizationObj.OrganizationID;
            trEle.getElementsByTagName("td")[0].insertAdjacentElement("beforeend", organizationNameLinkEle);

            trEle.insertAdjacentHTML("beforeend", "<td>" +
              (canEdit ?
                "<div class=\"field has-addons justify-flex-end\">" +
                "<p class=\"control\">" +
                "<a class=\"button is-small\" title=\"Edit Organization\" href=\"/organizations/" + organizationObj.OrganizationID + "/edit\">" +
                "<span class=\"icon\"><i class=\"fas fa-pencil-alt\"></i></span>" +
                "<span>Edit</span>" +
                "</a>" +
                "</p>" +
                "<p class=\"control\">" +
                "<a class=\"button is-small\" href=\"/licences/new/" + organizationObj.OrganizationID + "\">" +
                "<span class=\"icon\"><i class=\"fas fa-certificate\"></i></span>" +
                "<span>New</span>" +
                "</a>" +
                "</p>" +
                "</div>" :
                "") +
              "</td>");

            tbodyEle.insertAdjacentElement("beforeend", trEle);
          }
        }

      });
  }


  formEle.addEventListener("submit", function(formEvent) {
    formEvent.preventDefault();
  });

  const inputEles = formEle.getElementsByTagName("input");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
    inputEles[inputIndex].addEventListener("change", doOrganizationSearch);
  }

  doOrganizationSearch();
}());
