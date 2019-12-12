/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  /*
   * create user
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
    window.llm.showModal(createUser_modalEle);
  });

  let cancelButtonEles = createUser_modalEle.getElementsByClassName("is-cancel-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
    cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
  }

  // existing users

  const userContainerEle = document.getElementById("container--users");

  /*
   * update user
   */

  const updateUser_modalEle = document.getElementsByClassName("is-update-user-modal")[0];
  const updateUser_userNameSpanEles = updateUser_modalEle.getElementsByClassName("container--userName");

  window.llm.initializeTabs(updateUser_modalEle.getElementsByClassName("tabs")[0].getElementsByTagName("ul")[0]);

  function submitFn_updateUserSetting(formEvent) {
    formEvent.preventDefault();

    window.fetch("/admin/doUpdateUserProperty", {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEvent.currentTarget))
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(responseJSON) {
        if (responseJSON.success) {
          
        }
      });
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
    document.getElementById("userProperties--userName").value = userName;

    const userPropertiesContainerEle = document.getElementById("container--userProperties");

    window.llm.clearElement(userPropertiesContainerEle);

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

        for (let propertyName in userPropertiesJSON) {
          if (userPropertiesJSON.hasOwnProperty(propertyName)) {

            const propertyValue = userPropertiesJSON[propertyName];

            const formEle = document.createElement("form");

            formEle.innerHTML =
              "<input name=\"userName\" type=\"hidden\" value=\"" + userName + "\" />" +
              "<input name=\"propertyName\" type=\"hidden\" value=\"" + propertyName + "\" />" +
              "<div class=\"columns\">" +
              "<div class=\"column is-4\">" + propertyName + "</div>" +
              ("<div class=\"column\">" +
                "<div class=\"field has-addons\">" +
                "<div class=\"control is-expanded\">" +
                "<input class=\"input\" name=\"propertyValue\" type=\"text\" value=\"" + window.llm.escapeHTML(propertyValue) + "\" />" +
                "</div>" +
                "<div class=\"control\">" +
                "<button class=\"button\" type=\"submit\">" +
                "Save" +
                "</button>" +
                "</div>" +
                "</div>" +
                "</div>") +
              "</div>";

            formEle.addEventListener("submit", submitFn_updateUserSetting);

            userPropertiesContainerEle.insertAdjacentElement("beforeend", formEle);
          }
        }
      });


    // password form
    document.getElementById("resetPassword--userName").value = userName;

    document.getElementById("resetPassword--newPassword").closest(".message").setAttribute("hidden", "hidden");

    window.llm.showModal(updateUser_modalEle);
  }

  const updateUserButtonEles = userContainerEle.getElementsByTagName("a");

  for (let buttonIndex = 0; buttonIndex < updateUserButtonEles.length; buttonIndex += 1) {
    updateUserButtonEles[buttonIndex].addEventListener("click", clickFn_updateUser);
  }

  cancelButtonEles = updateUser_modalEle.getElementsByClassName("is-cancel-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
    cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
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
