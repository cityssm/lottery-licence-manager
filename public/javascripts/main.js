/* global document */

(function() {
  "use strict";

  const logoutModalEle = document.getElementsByClassName("is-logout-modal")[0];

  function openLogoutModal(clickEvent) {
    clickEvent.preventDefault();
    logoutModalEle.classList.add("is-active");
  }

  function closeLogoutModal(clickEvent) {
    clickEvent.preventDefault();
    logoutModalEle.classList.remove("is-active");
  }

  const logoutBtnEles = document.getElementsByClassName("is-logout-button");

  for (let logoutBtnIndex = 0; logoutBtnIndex < logoutBtnEles.length; logoutBtnIndex += 1) {
    logoutBtnEles[logoutBtnIndex].addEventListener("click", openLogoutModal);
  }

  logoutModalEle.getElementsByClassName("modal-close")[0].addEventListener("click", closeLogoutModal);
}());
