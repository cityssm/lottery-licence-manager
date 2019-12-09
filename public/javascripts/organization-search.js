/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  const formEle = document.getElementById("form--filters");
  const searchResultsEle = document.getElementById("container--searchResults");

  const canCreate = searchResultsEle.getAttribute("data-can-create") === "true";


  function doOrganizationSearch() {

    searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
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
            "<th><span class=\"sr-only\">Options</span></th>" +
            "</tr></thead>" +
            "<tbody></tbody>" +
            "</table>";

          const tbodyEle = searchResultsEle.getElementsByTagName("tbody")[0];

          for (let organizationIndex = 0; organizationIndex < organizationsList.length; organizationIndex += 1) {

            const organizationObj = organizationsList[organizationIndex];

            const trEle = document.createElement("tr");
            trEle.innerHTML = "<td></td>";

            const organizationNameLinkEle = document.createElement("a");
            organizationNameLinkEle.innerText = organizationObj.organizationName;
            organizationNameLinkEle.href = "/organizations/" + organizationObj.organizationID;
            trEle.getElementsByTagName("td")[0].insertAdjacentElement("beforeend", organizationNameLinkEle);

            trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
              (organizationObj.canUpdate ?
                "<a class=\"button is-small\" data-tooltip=\"Edit Organization\" href=\"/organizations/" + organizationObj.organizationID + "/edit\">" +
                "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                "<span>Edit</span>" +
                "</a>" : "") +
              (canCreate ?
                " <a class=\"button is-small\" data-tooltip=\"Create a New Licence\" href=\"/licences/new/" + organizationObj.organizationID + "\">" +
                "<span class=\"icon\"><i class=\"fas fa-certificate\" aria-hidden=\"true\"></i></span>" +
                "<span>New</span>" +
                "</a>" :
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
