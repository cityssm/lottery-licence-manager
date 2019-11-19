/* global window, document */

(function() {
  "use strict";

  window.llm = {};


  /*
   * MODAL TOGGLES
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
   * CONFIRM MODAL
   */

  window.llm.confirmModal = function(titleString, bodyHTML, okButtonHTML, contextualColorName, callbackFn) {

    const modalEle = document.createElement("div");
    modalEle.className = "modal is-active";

    modalEle.innerHTML = "<div class=\"modal-background\"></div>" +
      "<div class=\"modal-card\">" +
      ("<header class=\"modal-card-head has-background-" + contextualColorName + "\">" +
        "<h3 class=\"modal-card-title\"></h3>" +
        "</header>") +
      ("<section class=\"modal-card-body\">" + bodyHTML + "</section>") +
      ("<footer class=\"modal-card-foot is-justified-right\">" +
        "<button class=\"button is-cancel-button\" type=\"button\">Cancel</button>" +
        "<button class=\"button is-ok-button is-" + contextualColorName + "\" type=\"button\">" + okButtonHTML + "</button>" +
        "</footer>") +
      "</div>";

    modalEle.getElementsByClassName("modal-card-title")[0].innerText = titleString;

    modalEle.getElementsByClassName("is-cancel-button")[0].addEventListener("click", function() {
      modalEle.remove();
    });

    const okButtonEle = modalEle.getElementsByClassName("is-ok-button")[0];
    okButtonEle.addEventListener("click", function() {
      modalEle.remove();
      callbackFn();
    });

    document.body.insertAdjacentElement("beforeend", modalEle);

    okButtonEle.focus();
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


  function openLogoutModal() {
    window.llm.confirmModal("Log Out?",
      "<p>Are you sure you want to log out?</p>",
      "Log Out",
      "warning",
      function() {
        window.location.href = "/logout";
      });
  }


  const logoutBtnEles = document.getElementsByClassName("is-logout-button");

  for (let logoutBtnIndex = 0; logoutBtnIndex < logoutBtnEles.length; logoutBtnIndex += 1) {
    logoutBtnEles[logoutBtnIndex].addEventListener("click", openLogoutModal);
  }
}());
