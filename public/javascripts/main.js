/* global window, document */

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
 * CONFIG DEFAULTS
 */

window.llm.getDefaultConfigProperty = function(propertyName, propertyValueCallbackFn) {

  // check local storage

  try {

    let defaultConfigPropertiesString = window.localStorage.getItem("defaultConfigProperties");

    if (defaultConfigPropertiesString) {

      let defaultConfigProperties = JSON.parse(defaultConfigPropertiesString);

      propertyValueCallbackFn(defaultConfigProperties[propertyName]);

      return;

    }

  } catch (e) {
    // ignore
  }

  // populate local storage

  window.fetch("/dashboard/doGetDefaultConfigProperties")
    .then(function(response) {

      return response.json();

    })
    .then(function(defaultConfigProperties) {

      try {

        window.localStorage.setItem("defaultConfigProperties", JSON.stringify(defaultConfigProperties));

      } catch (e) {
        // ignore
      }

      propertyValueCallbackFn(defaultConfigProperties[propertyName]);

    });

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

window.llm.openHtmlModal = function(htmlFileName, callbackFns) {

  /*
   * callbackFns
   *
   * - onshow(modalEle)
   *     loaded, part of DOM, not yet visible
   * - onshown(modalEle, closeModalFn)
   *     use closeModalFn() to close the modal properly when not using the close buttons
   * - onhide(modalEle)
   *     return false to cancel hide
   * - onhidden(modalEle)
   *     hidden, but still part of the DOM
   * - onremoved()
   *     no longer part of the DOM
   */

  window.fetch("/html/" + htmlFileName + ".html")
    .then(function(response) {

      return response.text();

    })
    .then(function(modalHTML) {

      // append the modal to the end of the body

      const modalContainerEle = document.createElement("div");
      modalContainerEle.innerHTML = modalHTML;

      const modalEle = modalContainerEle.getElementsByClassName("modal")[0];

      document.body.insertAdjacentElement("beforeend", modalContainerEle);

      // call the onshow

      if (callbackFns && callbackFns.onshow) {

        callbackFns.onshow(modalEle);

      }

      // show the modal

      modalEle.classList.add("is-active");

      const closeModalFn = function() {

        const modalWasShown = modalEle.classList.contains("is-active");

        if (callbackFns && callbackFns.onhide && modalWasShown) {

          let doHide = callbackFns.onhide(modalEle);

          if (doHide) {

            return;

          }

        }

        modalEle.classList.remove("is-active");

        if (callbackFns && callbackFns.onhidden && modalWasShown) {

          callbackFns.onhidden(modalEle);

        }

        modalContainerEle.remove();

        if (callbackFns && callbackFns.onremoved) {

          callbackFns.onremoved();

        }

      };

      // call the onshown

      if (callbackFns && callbackFns.onshown) {

        callbackFns.onshown(modalEle, closeModalFn);

      }

      // set up close buttons

      const closeModalBtnEles = modalEle.getElementsByClassName("is-close-modal-button");

      for (let btnIndex = 0; btnIndex < closeModalBtnEles.length; btnIndex += 1) {

        closeModalBtnEles[btnIndex].addEventListener("click", closeModalFn);

      }

    });

};


/*
 * TABS
 */

window.llm.initializeTabs = function(tabsListEle) {

  if (!tabsListEle) {

    return;

  }

  const isPanelTabs = tabsListEle.classList.contains("panel-tabs");

  const listItemEles = tabsListEle.getElementsByTagName(isPanelTabs ? "a" : "li");

  function tabClickFn(clickEvent) {

    clickEvent.preventDefault();

    const tabLinkEle = clickEvent.currentTarget;
    const tabContentEle = document.getElementById(tabLinkEle.getAttribute("href").substring(1));

    // remove is-active from all tabs
    for (let index = 0; index < listItemEles.length; index += 1) {

      listItemEles[index].classList.remove("is-active");

    }

    // add is-active to the selected tab
    (isPanelTabs ? tabLinkEle : tabLinkEle.parentNode).classList.add("is-active");

    const tabContentEles = tabContentEle.parentNode.getElementsByClassName("tab-content");

    for (let index = 0; index < tabContentEles.length; index += 1) {

      tabContentEles[index].classList.remove("is-active");

    }

    tabContentEle.classList.add("is-active");

  }

  for (let index = 0; index < listItemEles.length; index += 1) {

    (isPanelTabs ? listItemEles[index] : listItemEles[index].getElementsByTagName("a")[0]).addEventListener("click", tabClickFn);

  }

};


(function() {


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

    const contextualColorIsDark = (contextualColorName === "warning" ? false : true);

    modalEle.innerHTML = "<div class=\"modal-background\"></div>" +
      "<div class=\"modal-card\">" +
      ("<header class=\"modal-card-head has-background-" + contextualColorName + "\">" +
        "<h3 class=\"modal-card-title" + (contextualColorIsDark ? " has-text-white" : "") + "\"></h3>" +
        "</header>") +
      (bodyHTML === "" ?
        "" :
        "<section class=\"modal-card-body\">" + bodyHTML + "</section>") +
      ("<footer class=\"modal-card-foot justify-flex-end\">" +
        (modalOptions.hideCancelButton ?
          "" :
          "<button class=\"button is-cancel-button\" type=\"button\" aria-label=\"Cancel\">" + cancelButtonHTML + "</button>") +
        "<button class=\"button is-ok-button is-" + contextualColorName + "\" type=\"button\" aria-label=\"OK\">" + okButtonHTML + "</button>" +
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

        window.localStorage.clear();
        window.location.href = "/logout";

      });

  }


  const logoutBtnEles = document.getElementsByClassName("is-logout-button");

  for (let logoutBtnIndex = 0; logoutBtnIndex < logoutBtnEles.length; logoutBtnIndex += 1) {

    logoutBtnEles[logoutBtnIndex].addEventListener("click", openLogoutModal);

  }

}());
