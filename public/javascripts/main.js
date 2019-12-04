/* global window, document */

(function() {
  "use strict";

  window.llm = {};


  /*
   * HELPERS
   */

  window.llm.clearElement = function(ele) {
    while (ele.firstChild) {
      ele.removeChild(ele.firstChild);
    }
  };

  window.llm.escapeHTML = function(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  window.llm.arrayToObject = function(array, objectKey) {

    let obj = {};

    for (let arrayIndex = 0; arrayIndex < array.length; arrayIndex += 1) {
      obj[array[arrayIndex][objectKey]] = array[arrayIndex];
    }

    return obj;
  };



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

  function confirmModalFn(modalOptions) {

    const modalEle = document.createElement("div");
    modalEle.className = "modal is-active";

    const contextualColorName = modalOptions.contextualColorName || "info";

    const titleString = modalOptions.titleString || "";
    const bodyHTML = modalOptions.bodyHTML || "";

    const cancelButtonHTML = modalOptions.cancelButtomHTML || "Cancel";
    const okButtonHTML = modalOptions.okButtonHTML || "OK";


    modalEle.innerHTML = "<div class=\"modal-background\"></div>" +
      "<div class=\"modal-card\">" +
      ("<header class=\"modal-card-head has-background-" + contextualColorName + "\">" +
        "<h3 class=\"modal-card-title" + (contextualColorName === "danger" ? " has-text-white" : "") + "\"></h3>" +
        "</header>") +
      ("<section class=\"modal-card-body\">" + bodyHTML + "</section>") +
      ("<footer class=\"modal-card-foot justify-flex-end\">" +
        (modalOptions.hideCancelButton ?
          "" :
          "<button class=\"button is-cancel-button\" type=\"button\">" + cancelButtonHTML + "</button>") +
        "<button class=\"button is-ok-button is-" + contextualColorName + "\" type=\"button\">" + okButtonHTML + "</button>" +
        "</footer>") +
      "</div>";

    modalEle.getElementsByClassName("modal-card-title")[0].innerText = titleString;

    if (!modalOptions.hideCancelButton) {
      modalEle.getElementsByClassName("is-cancel-button")[0].addEventListener("click", function() {
        modalEle.remove();
      });
    }

    const okButtonEle = modalEle.getElementsByClassName("is-ok-button")[0];
    okButtonEle.addEventListener("click", function() {
      modalEle.remove();
      if (modalOptions.callbackFn) {
        modalOptions.callbackFn();
      }
    });

    document.body.insertAdjacentElement("beforeend", modalEle);

    okButtonEle.focus();
  }

  window.llm.confirmModal = function(titleString, bodyHTML, okButtonHTML, contextualColorName, callbackFn) {
    confirmModalFn({
      contextualColorName: contextualColorName,
      titleString: titleString,
      bodyHTML: bodyHTML,
      okButtonHTML: okButtonHTML,
      callbackFn: callbackFn
    });
  };

  window.llm.alertModal = function(titleString, bodyHTML, okButtonHTML, contextualColorName) {
    confirmModalFn({
      contextualColorName: contextualColorName,
      titleString: titleString,
      bodyHTML: bodyHTML,
      hideCancelButton: true,
      okButtonHTML: okButtonHTML
    });
  };


  /*
   * TABS
   */

  window.llm.initializeTabs = function(tabsListEle) {

    const listItemEles = tabsListEle.getElementsByTagName("li");

    function tabClickFn(clickEvent) {
      clickEvent.preventDefault();

      const tabLinkEle = clickEvent.currentTarget;
      const tabContentEle = document.getElementById(tabLinkEle.getAttribute("href").substring(1));

      // remove is-active from all tabs
      for (let index = 0; index < listItemEles.length; index += 1) {
        listItemEles[index].classList.remove("is-active");
      }

      // add is-active to the selected tab
      tabLinkEle.parentNode.classList.add("is-active");

      const tabContentEles = tabContentEle.parentNode.getElementsByClassName("tab-content");

      for (let index = 0; index < tabContentEles.length; index += 1) {
        tabContentEles[index].classList.remove("is-active");
      }

      tabContentEle.classList.add("is-active");
    }

    for (let index = 0; index < listItemEles.length; index += 1) {
      listItemEles[index].getElementsByTagName("a")[0].addEventListener("click", tabClickFn);
    }
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


  function openLogoutModal(clickEvent) {
    clickEvent.preventDefault();
    window.llm.confirmModal("Log Out?",
      "<p>Are you sure you want to log out?</p>",
      "<span class=\"icon\"><i class=\"fas fa-sign-out-alt\" aria-hidden=\"true\"></i></span><span>Log Out</span>",
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
