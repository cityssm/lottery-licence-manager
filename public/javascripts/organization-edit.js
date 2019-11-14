/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  window.llm.enableNavBlocker();

  const formEle = document.getElementById("form--organization");
  const formMessageEle = document.getElementById("container--form-message");
  const isCreate = document.getElementById("organization--organizationID").value === "";


  function doOrganizationSave(formEvent) {
    formEvent.preventDefault();

    window.fetch("/organizations/doSave", {
        method: "post",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEle))
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(responseJSON) {

        if (responseJSON.success && isCreate) {
          window.llm.disableNavBlocker();
          window.location.href = "/organizations/" + responseJSON.organizationID;
        } else {
          formMessageEle.innerHTML = "<div class=\"is-size-7 " + (responseJSON.success ? "has-text-success" : "has-text-danger") + "\">" +
            responseJSON.message +
            "</div>";
        }
      });
  }

  formEle.addEventListener("submit", doOrganizationSave);
}());
