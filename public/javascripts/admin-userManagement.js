"use strict";

(function() {

  /*
   * Create user
   */

  const createUser_modalEle = document.getElementsByClassName("is-create-user-modal")[0];

  createUser_modalEle.getElementsByTagName("form")[0].addEventListener("submit", function(formEvent) {

    formEvent.preventDefault();

    window.fetch("/admin/doCreateUser", {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEvent.currentTarget))
      })
      .then(function(response) {

        return response.json();

      })
      .then(function(responseJSON) {

        if (responseJSON.success) {

          window.location.reload(true);

        }

      });

  });

  document.getElementsByClassName("is-create-user-button")[0].addEventListener("click", function() {

    llm.showModal(createUser_modalEle);

  });

  let cancelButtonEles = createUser_modalEle.getElementsByClassName("is-cancel-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {

    cancelButtonEles[buttonIndex].addEventListener("click", llm.hideModal);

  }

  // existing users

  const userContainerEle = document.getElementById("container--users");

  /*
   * update user
   */

  const updateUser_modalEle = document.getElementsByClassName("is-update-user-modal")[0];
  const updateUser_userNameSpanEles = updateUser_modalEle.getElementsByClassName("container--userName");

  llm.initializeTabs(updateUser_modalEle.getElementsByClassName("tabs")[0].getElementsByTagName("ul")[0]);

  function submitFn_updateUserSetting(formEvent) {

    formEvent.preventDefault();

    const formEle = formEvent.currentTarget;

    window.fetch("/admin/doUpdateUserProperty", {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEle))
      })
      .then(function(response) {

        return response.json();

      })
      .then(function(responseJSON) {

        if (responseJSON.success) {

          const inputEle = formEle.getElementsByClassName("input")[0];

          inputEle.classList.add("is-success");
          inputEle.classList.remove("is-danger");

          const submitBtnEle = formEle.getElementsByTagName("button")[0];

          submitBtnEle.classList.add("is-success");
          submitBtnEle.classList.remove("is-danger");

        }

      });

  }

  function keyupFn_markSettingUnsaved(keyupEvent) {

    const inputEle = keyupEvent.currentTarget;

    inputEle.classList.add("is-danger");
    inputEle.classList.remove("is-primary");
    inputEle.classList.remove("is-success");

    const submitBtnEle = inputEle.closest(".field").getElementsByTagName("button")[0];

    submitBtnEle.classList.add("is-danger");
    submitBtnEle.classList.remove("is-primary");
    submitBtnEle.classList.remove("is-success");

  }

  function clickFn_updateUser(clickEvent) {

    const linkEle = clickEvent.currentTarget;

    const userName = linkEle.getAttribute("data-user-name");
    const firstName = linkEle.getAttribute("data-first-name");
    const lastName = linkEle.getAttribute("data-last-name");

    // spans
    for (let index = 0; index < updateUser_userNameSpanEles.length; index += 1) {

      updateUser_userNameSpanEles[index].innerText = userName;

    }

    // name form
    document.getElementById("updateUser--userName").value = userName;
    document.getElementById("updateUser--firstName").value = firstName;
    document.getElementById("updateUser--lastName").value = lastName;

    // properties form

    const userPropertiesContainerEle = document.getElementById("container--userProperties");

    llm.clearElement(userPropertiesContainerEle);

    window.fetch("/admin/doGetUserProperties", {
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
      .then(function(userPropertiesJSON) {

        let propertyIndex = 0;

        for (let propertyName in userPropertiesJSON) {

          if (userPropertiesJSON.hasOwnProperty(propertyName)) {

            propertyIndex += 1;

            const propertyValue = userPropertiesJSON[propertyName];

            const formEle = document.createElement("form");

            formEle.innerHTML =
              "<input name=\"userName\" type=\"hidden\" value=\"" + userName + "\" />" +
              "<input name=\"propertyName\" type=\"hidden\" value=\"" + propertyName + "\" />" +
              "<div class=\"columns\">" +
              ("<div class=\"column is-4\">" +
                "<label class=\"label\" for=\"userProperties--propertyValue-" + propertyIndex + "\">" +
                propertyName +
                "</label>" +
                "</div>") +
              ("<div class=\"column\">" +
                "<div class=\"field has-addons\">" +
                "<div class=\"control is-expanded\">" +
                ("<input class=\"input is-primary\"" +
                  " id=\"userProperties--propertyValue-" + propertyIndex + "\" name=\"propertyValue\"" +
                  " type=\"text\" value=\"" + llm.escapeHTML(propertyValue) + "\"" +
                  " placeholder=\"(Use Default)\" />") +
                "</div>" +
                "<div class=\"control\">" +
                "<button class=\"button is-outlined is-primary\" type=\"submit\">" +
                "Save" +
                "</button>" +
                "</div>" +
                "</div>" +
                "</div>") +
              "</div>";

            formEle.getElementsByClassName("input")[0].addEventListener("keyup", keyupFn_markSettingUnsaved);

            formEle.addEventListener("submit", submitFn_updateUserSetting);

            userPropertiesContainerEle.insertAdjacentElement("beforeend", formEle);

          }

        }

      });


    // Password form
    document.getElementById("resetPassword--userName").value = userName;

    document.getElementById("resetPassword--newPassword")
      .closest(".message")
      .setAttribute("hidden", "hidden");

    llm.showModal(updateUser_modalEle);

  }

  const updateUserButtonEles = userContainerEle.getElementsByTagName("a");

  for (let buttonIndex = 0; buttonIndex < updateUserButtonEles.length; buttonIndex += 1) {

    updateUserButtonEles[buttonIndex].addEventListener("click", clickFn_updateUser);

  }

  cancelButtonEles = updateUser_modalEle.getElementsByClassName("is-cancel-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {

    cancelButtonEles[buttonIndex].addEventListener("click", llm.hideModal);

  }

  // user name

  document.getElementById("tab--updateUser-name").getElementsByTagName("form")[0]
    .addEventListener("submit", function(formEvent) {

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

            window.location.reload(true);

          }

        });

    });

  // reset password

  document.getElementById("tab--updateUser-password").getElementsByTagName("form")[0]
    .addEventListener("submit", function(formEvent) {

      formEvent.preventDefault();

      window.fetch("/admin/doResetPassword", {
          method: "POST",
          credentials: "include",
          body: new URLSearchParams(new FormData(formEvent.currentTarget))
        })
        .then(function(response) {

          return response.json();

        })
        .then(function(responseJSON) {

          if (responseJSON.success) {

            const newPasswordEle = document.getElementById("resetPassword--newPassword");

            newPasswordEle.innerText = responseJSON.newPassword;

            newPasswordEle.closest(".message").removeAttribute("hidden");

          }

        });

    });

}());
