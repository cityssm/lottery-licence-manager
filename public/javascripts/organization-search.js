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
        }

      });
  }

  formEle.addEventListener("submit", doOrganizationSearch);
  doOrganizationSearch();
}());
