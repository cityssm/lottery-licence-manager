/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  function getMessageEle(formEle) {
    return formEle.closest("tr").getElementsByClassName("formMessage")[0];
  }

  // form

  function submitFn(formEvent) {
    formEvent.preventDefault();

    const formEle = formEvent.currentTarget;
    const messageEle = getMessageEle(formEle);

    messageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    window.fetch("/admin/doSaveApplicationSetting", {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEle))
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(responseJSON) {
        if (responseJSON.success) {
          messageEle.innerHTML = "<span class=\"has-text-success\">Updated Successfully</span>";
        } else {
          messageEle.innerHTML = "<span class=\"has-text-danger\">Update Error</span>";
        }
      });
  }

  function changeFn(inputEvent) {
    getMessageEle(inputEvent.currentTarget).innerHTML = "<span class=\"has-text-info\">Unsaved Changes</span>";
  }

  const formEles = document.getElementsByClassName("form--applicationSetting");

  for (let formIndex = 0; formIndex < formEles.length; formIndex += 1) {
    formEles[formIndex].addEventListener("submit", submitFn);
    formEles[formIndex].getElementsByClassName("input")[0].addEventListener("change", changeFn);
  }
}());
