/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  // create user

  const createUserModalEle = document.getElementsByClassName("is-create-user-modal")[0];

  createUserModalEle.getElementsByTagName("form")[0].addEventListener("submit", function(formEvent) {
    formEvent.preventDefault();
  });

  document.getElementsByClassName("is-create-user-button")[0].addEventListener("click", function() {
    window.llm.showModal(createUserModalEle);
  });

  // existing users

  const userContainerEle = document.getElementById("container--users");

  // update user

  function submitFn_updateUser(formEvent) {
    formEvent.preventDefault();

    window.fetch("/admin/doUpdateUser", {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEvent.currentTarget))
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(responseJSON) {
        if (responseJSON.success) {
          window.llm.alertModal("User Updated Successfully", "", "OK",
            "success");

        } else {
          window.llm.alertModal("User Not Updated", "Please try again.", "OK",
            "danger");
        }
      });
  }

  const userFormEles = userContainerEle.getElementsByClassName("form--user");

  for (let formIndex = 0; formIndex < userFormEles.length; formIndex += 1) {
    userFormEles[formIndex].addEventListener("submit", submitFn_updateUser);
  }

  // reset password

  function clickFn_resetPassword(clickEvent) {

    const userName = clickEvent.currentTarget.closest(".panel-block").getAttribute("data-user-name");

    const resetFn = function() {

      window.fetch("/admin/doResetPassword", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userName: userName
          })
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(responseJSON) {
          if (responseJSON.success) {
            window.llm.alertModal("Password Reset Successfully",
              "<p>The password for \"" + userName + "\" has been reset to <strong>" + responseJSON.newPassword + "</strong>.</p>",
              "OK",
              "success");

          } else {
            window.llm.alertModal("Password Not Updated", "Please try again.", "OK",
              "danger");
          }
        });
    };

    window.llm.confirmModal("Reset Password?",
      "Are you sure you want to reset the password for \"" + userName + "\"?",
      "Yes, Reset",
      "warning",
      resetFn);
  }

  const resetButtonEles = userContainerEle.getElementsByClassName("is-password-reset-button");

  for (let buttonIndex = 0; buttonIndex < resetButtonEles.length; buttonIndex += 1) {
    resetButtonEles[buttonIndex].addEventListener("click", clickFn_resetPassword);
  }
}());
