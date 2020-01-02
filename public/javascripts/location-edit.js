/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  const formEle = document.getElementById("form--location");
  const formMessageEle = document.getElementById("container--form-message");
  const locationID = document.getElementById("location--locationID").value;
  const isCreate = locationID === "";


  formEle.addEventListener("submit", function(formEvent) {
    formEvent.preventDefault();

    formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    window.fetch(
        (isCreate ? "/locations/doCreate" : "/locations/doUpdate"), {
          method: "POST",
          credentials: "include",
          body: new URLSearchParams(new FormData(formEle))
        })
      .then(function(response) {
        return response.json();
      })
      .then(function(responseJSON) {

        if (responseJSON.success) {
          window.llm.disableNavBlocker();
        }

        if (responseJSON.success && isCreate) {
          window.location.href = "/locations/" + responseJSON.locationID + "/edit";

        } else {
          formMessageEle.innerHTML = "";

          window.llm.alertModal(responseJSON.message, "", "OK",
            responseJSON.success ? "success" : "danger");
        }
      });
  });


  if (!isCreate) {

    const deleteLocationFn = function() {

      window.fetch("/locations/doDelete", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            locationID: locationID
          })
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(responseJSON) {
          if (responseJSON.success) {
            window.location.href = "/locations";
          }
        });
    };

    formEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", function() {

      window.llm.confirmModal("Delete Location?",
        ("Are you sure you want to delete this location?<br />" +
          "Note that any active licences associated with this location will remain active."),
        "Yes, Delete Location",
        "warning",
        deleteLocationFn);
    });
  }


  // Nav blocker

  function setUnsavedChanges() {
    window.llm.enableNavBlocker();
    formMessageEle.innerHTML = "<div class=\"has-text-info\">" +
      "<i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i> Unsaved Changes" +
      "</div>";
  }

  const inputEles = formEle.getElementsByClassName("input");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
    inputEles[inputIndex].addEventListener("change", setUnsavedChanges);
  }
}());
