/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  const changePasswordModalEle = document.getElementsByClassName("is-change-password-modal")[0];

  changePasswordModalEle.getElementsByTagName("form")[0].addEventListener("submit", function(formEvent) {
    formEvent.preventDefault();

    const formEle = formEvent.currentTarget;

    window.fetch("/dashboard/doChangePassword", {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEle))
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(responseJSON) {
        if (responseJSON.success) {
          window.llm.hideModal(changePasswordModalEle);
          window.llm.alertModal("Password Updated Successfully", "", "OK", "success");
        }
      });
  });

  document.getElementsByClassName("is-change-password-button")[0].addEventListener("click", function() {
    window.llm.showModal(changePasswordModalEle);
  });

  let cancelButtonEles = changePasswordModalEle.getElementsByClassName("is-cancel-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
    cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
  }
}());
