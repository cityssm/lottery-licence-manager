/* global window, document */

(function() {
  "use strict";

  window.llm = {};


  /*
   * MOADL TOGGLES
   */

  window.llm.showModal = function(modalEle) {
    modalEle.classList.add("is-active");
  };

  window.llm.hideModal = function(internalEle_or_internalEvent) {

    const internalEle = internalEle_or_internalEvent.currentTarget || internalEle_or_internalEvent;

    const modalEle = (internalEle.classList.contains("modal") ? internalEle : internalEle.closest(".modal"));

    modalEle.classList.remove("is-active");
  };


  /*
   * NAV BLOCKER
   */

  let isNavBlockerEnabled = false;

  function navBlockerEventFn(e) {
    const confirmationMessage = "You have unsaved changes that may be lost.";
    e.returnValue = confirmationMessage;
    return confirmationMessage;
  }

  window.llm.enableNavBlocker = function() {
    if (!isNavBlockerEnabled) {
      window.addEventListener("beforeunload", navBlockerEventFn);
      isNavBlockerEnabled = true;
    }
  };

  window.llm.disableNavBlocker = function() {
    if (isNavBlockerEnabled) {
      window.removeEventListener("beforeunload", navBlockerEventFn);
      isNavBlockerEnabled = false;
    }
  };


  /*
   * NAVBAR TOGGLE
   */

  document.getElementById("navbar-burger--main").addEventListener("click", function(clickEvent) {
    clickEvent.currentTarget.classList.toggle("is-active");
    document.getElementById("navbar-menu--main").classList.toggle("is-active");
  });


  /*
   * LOGOUT MODAL
   */

  const logoutModalEle = document.getElementsByClassName("is-logout-modal")[0];

  function openLogoutModal(clickEvent) {
    clickEvent.preventDefault();
    window.llm.showModal(logoutModalEle);
  }

  function closeLogoutModal(clickEvent) {
    clickEvent.preventDefault();
    window.llm.hideModal(logoutModalEle);
  }

  const logoutBtnEles = document.getElementsByClassName("is-logout-button");

  for (let logoutBtnIndex = 0; logoutBtnIndex < logoutBtnEles.length; logoutBtnIndex += 1) {
    logoutBtnEles[logoutBtnIndex].addEventListener("click", openLogoutModal);
  }

  const cancelButtonEles = logoutModalEle.getElementsByClassName("is-cancel-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
    cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
  }
}());
