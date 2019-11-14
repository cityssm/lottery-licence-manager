/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  const formEle = document.getElementById("form--filters");
  const searchResultsEle = document.getElementById("container--searchResults");


  function doOrganizationSearch(formEvent) {

    if (formEvent) {
      formEvent.preventDefault();
    }

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

            tbodyEle.insertAdjacentElement("beforeend", trEle);
          }
        }

      });
  }

  formEle.addEventListener("submit", doOrganizationSearch);
  doOrganizationSearch();
}());
