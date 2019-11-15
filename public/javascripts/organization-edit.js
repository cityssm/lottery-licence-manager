/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";


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

        window.llm.disableNavBlocker();

        if (responseJSON.success && isCreate) {
          window.location.href = "/organizations/" + responseJSON.organizationID + "/edit";
        } else {
          formMessageEle.innerHTML = "<div class=\"is-size-7 " + (responseJSON.success ? "has-text-success" : "has-text-danger") + "\">" +
            responseJSON.message +
            "</div>";
        }
      });
  }

  formEle.addEventListener("submit", doOrganizationSave);


  function setUnsavedChanges() {
    window.llm.enableNavBlocker();
    formMessageEle.innerHTML = "<div class=\"is-size-7 has-text-info\">" +
      "<i class=\"fas fa-exclamation-triangle\"></i> Unsaved Changes" +
      "</div>";
  }

  const inputEles = formEle.getElementsByClassName("input");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
    inputEles[inputIndex].addEventListener("change", setUnsavedChanges);
  }
}());
