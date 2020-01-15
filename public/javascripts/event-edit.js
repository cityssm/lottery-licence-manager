/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  const eventDateNavEle = document.getElementById("eventNav--eventDate");

  const formEle = document.getElementById("form--event");
  const formMessageEle = document.getElementById("container--form-message");

  const licenceID = document.getElementById("event--licenceID").value;
  const eventDate = document.getElementById("event--eventDate").value;


  formEle.addEventListener("submit", function(formEvent) {
    formEvent.preventDefault();

    formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    window.fetch("/events/doSave", {
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
          eventDateNavEle.removeAttribute("disabled");
        }

        formMessageEle.innerHTML = "";

        window.llm.alertModal(responseJSON.message, "", "OK",
          responseJSON.success ? "success" : "danger");
      });
  });


  document.getElementById("is-delete-event-button").addEventListener("click", function(clickEvent) {
    clickEvent.preventDefault();

    window.llm.confirmModal("Delete Event?", "Are you sure you want to delete this event?", "Yes, Delete", "danger", function() {

      window.fetch("/events/doDelete", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            licenceID: licenceID,
            eventDate: eventDate
          })
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(responseJSON) {

          if (responseJSON.success) {
            window.llm.disableNavBlocker();
            window.location.href = "/licences/" + licenceID;
          }
        });
    });
  });


  // Nav blocker

  function setUnsavedChanges() {

    window.llm.enableNavBlocker();
    eventDateNavEle.setAttribute("disabled", "disabled");

    formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";
  }

  const inputEles = formEle.querySelectorAll("input, select, textarea");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
    if (inputEles[inputIndex].name !== "") {
      inputEles[inputIndex].addEventListener("change", setUnsavedChanges);
    }
  }


}());
