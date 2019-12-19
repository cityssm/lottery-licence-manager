/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  const changePasswordModalEles = document.getElementsByClassName("is-change-password-modal");

  if (changePasswordModalEles.length > 0) {

    changePasswordModalEles[0].getElementsByTagName("form")[0].addEventListener("submit", function(formEvent) {
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
            window.llm.hideModal(changePasswordModalEles[0]);
            window.llm.alertModal("Password Updated Successfully", "", "OK", "success");
          }
        });
    });

    document.getElementsByClassName("is-change-password-button")[0].addEventListener("click", function() {
      changePasswordModalEles[0].getElementsByTagName("form")[0].reset();
      window.llm.showModal(changePasswordModalEles[0]);
    });

    let cancelButtonEles = changePasswordModalEles[0].getElementsByClassName("is-cancel-button");

    for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
      cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
    }
  }
}());
