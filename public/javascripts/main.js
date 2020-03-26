"use strict";

window.llm = {};


/*
 * HELPERS
 */


/**
 * Clears the content of an element.
 *
 * @param {HTMLElement} ele Element to clear
 */
llm.clearElement = function(ele) {

  while (ele.firstChild) {

    ele.removeChild(ele.firstChild);

  }

};


/**
 * Escapes a potentially unsafe string.
 *
 * @param  {string} str A string potentially containing characters unsafe for writing on a webpage.
 * @returns {string}    A string with unsafe characters escaped.
 */
llm.escapeHTML = function(str) {

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

};


/**
 * Converts an array of objects into an object, keyed by a property from each object
 *
 * @param  {Object[]} array   The array of objects
 * @param  {string} objectKey The property to use as the key
 * @returns {Object}          The new object
 */
llm.arrayToObject = function(array, objectKey) {

  const obj = {};

  for (let arrayIndex = 0; arrayIndex < array.length; arrayIndex += 1) {

    obj[array[arrayIndex][objectKey]] = array[arrayIndex];

  }

  return obj;

};


/*
 * DATE RANGE
 */


llm.initializeDateRangeSelector = function(containerEle, changeFn) {

  const rangeTypeSelectEle = containerEle.querySelector("[data-field='rangeType']").getElementsByTagName("select")[0];

  const rangeSelectEle = containerEle.querySelector("[data-field='range']").getElementsByTagName("select")[0];

  const dateOptionEle = rangeSelectEle.querySelector("[data-range-type='']");
  const yearOptgroupEle = rangeSelectEle.querySelector("[data-range-type='year']");
  const quarterOptgroupEle = rangeSelectEle.querySelector("[data-range-type='quarter']");
  const monthOptgroupEle = rangeSelectEle.querySelector("[data-range-type='month']");

  const startDateEle = containerEle.querySelector("[data-field='start']").getElementsByTagName("input")[0];

  const endDateEle = containerEle.querySelector("[data-field='end']").getElementsByTagName("input")[0];

  const setStartEndDatesFromRange = function() {

    const rangeValue = rangeSelectEle.value;

    if (rangeValue === "") {

      return;

    }

    let startDateString = "";
    let endDateString = "";

    const range = rangeValue.split("-");

    if (range.length === 1) {

      // Year

      startDateString = range[0] + "-01-01";
      endDateString = range[0] + "-12-31";

    } else if (range[1] === "q") {

      // Quarter

      const jsQuarterStartMonth = (range[2] - 1) * 3;

      startDateString = range[0] + "-" + ("0" + (jsQuarterStartMonth + 1)).slice(-2) + "-01";

      const endDate = new Date(range[0], jsQuarterStartMonth + 3, 0);

      endDateString = range[0] + "-" + ("0" + (endDate.getMonth() + 1)).slice(-2) + "-" + endDate.getDate();

    } else {

      // Month

      const jsQuarterStartMonth = (range[1] - 1);

      startDateString = range[0] + "-" + ("0" + (jsQuarterStartMonth + 1)).slice(-2) + "-01";

      const endDate = new Date(range[0], jsQuarterStartMonth + 1, 0);

      endDateString = range[0] + "-" + ("0" + (endDate.getMonth() + 1)).slice(-2) + "-" + endDate.getDate();

    }

    startDateEle.value = startDateString;
    endDateEle.setAttribute("min", startDateString);
    endDateEle.value = endDateString;

    if (changeFn) {

      changeFn();

    }

  };


  rangeTypeSelectEle.addEventListener("change", function() {

    const rangeType = rangeTypeSelectEle.value;

    if (rangeType === "") {

      rangeSelectEle.setAttribute("readonly", "readonly");
      rangeSelectEle.classList.add("is-readonly");

      dateOptionEle.classList.remove("is-hidden");
      yearOptgroupEle.classList.add("is-hidden");
      quarterOptgroupEle.classList.add("is-hidden");
      monthOptgroupEle.classList.add("is-hidden");

      rangeSelectEle.value = "";

      startDateEle.removeAttribute("readonly");
      startDateEle.classList.remove("is-readonly");

      endDateEle.removeAttribute("readonly");
      endDateEle.classList.remove("is-readonly");

    } else {

      rangeSelectEle.removeAttribute("readonly");
      rangeSelectEle.classList.remove("is-readonly");

      if (rangeType === "year") {

        yearOptgroupEle.classList.remove("is-hidden");
        rangeSelectEle.value = yearOptgroupEle.children[0].value;

      } else {

        yearOptgroupEle.classList.add("is-hidden");

      }

      if (rangeType === "quarter") {

        quarterOptgroupEle.classList.remove("is-hidden");
        rangeSelectEle.value = quarterOptgroupEle.children[0].value;

      } else {

        quarterOptgroupEle.classList.add("is-hidden");

      }

      if (rangeType === "month") {

        monthOptgroupEle.classList.remove("is-hidden");
        rangeSelectEle.value = monthOptgroupEle.children[0].value;

      } else {

        monthOptgroupEle.classList.add("is-hidden");

      }

      dateOptionEle.classList.add("is-hidden");

      startDateEle.setAttribute("readonly", "readonly");
      startDateEle.classList.add("is-readonly");

      endDateEle.setAttribute("readonly", "readonly");
      endDateEle.classList.add("is-readonly");

      setStartEndDatesFromRange();

    }

  });

  rangeSelectEle.addEventListener("change", setStartEndDatesFromRange);

  startDateEle.addEventListener("change", function() {

    endDateEle.setAttribute("min", startDateEle.value);
    changeFn();

  });

  endDateEle.addEventListener("change", changeFn);

};


llm.dateToString = function(dateObj) {

  return dateObj.getFullYear() + "-" +
    ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" +
    ("0" + (dateObj.getDate())).slice(-2);

};


/*
 * FETCH HELPERS
 */

llm.responseToJSON = function(response) {

  return response.json();

};

/**
 * @param {string} fetchUrl
 * @param {Element | Object} formEleOrObj
 * @param {function} responseFn
 */
llm.postJSON = function(fetchUrl, formEleOrObj, responseFn) {

  const fetchOptions = {
    method: "POST",
    credentials: "include"
  };


  if (formEleOrObj) {

    if (formEleOrObj.tagName && formEleOrObj.tagName === "FORM") {

      fetchOptions.body = new URLSearchParams(new FormData(formEleOrObj));

    } else if (formEleOrObj.constructor === Object) {

      fetchOptions.headers = {
        "Content-Type": "application/json"
      };

      fetchOptions.body = JSON.stringify(formEleOrObj);

    }

  }


  window.fetch(fetchUrl, fetchOptions)
    .then(llm.responseToJSON)
    .then(responseFn);

};


/*
 * CONFIG DEFAULTS
 */

llm.getDefaultConfigProperty = function(propertyName, propertyValueCallbackFn) {

  // Check local storage

  try {

    const defaultConfigPropertiesString = window.localStorage.getItem("defaultConfigProperties");

    if (defaultConfigPropertiesString) {

      const defaultConfigProperties = JSON.parse(defaultConfigPropertiesString);

      propertyValueCallbackFn(defaultConfigProperties[propertyName]);

      return;

    }

  } catch (e) {
    // Ignore
  }

  // Populate local storage

  llm.postJSON(
    "/dashboard/doGetDefaultConfigProperties", {},
    function(defaultConfigProperties) {

      try {

        window.localStorage.setItem("defaultConfigProperties", JSON.stringify(defaultConfigProperties));

      } catch (e) {
        // Ignore
      }

      propertyValueCallbackFn(defaultConfigProperties[propertyName]);

    }
  );

};


/*
 * MODAL TOGGLES
 */

llm.showModal = function(modalEle) {

  modalEle.classList.add("is-active");

};

llm.hideModal = function(internalEle_or_internalEvent) {

  const internalEle = internalEle_or_internalEvent.currentTarget || internalEle_or_internalEvent;

  const modalEle = (internalEle.classList.contains("modal") ? internalEle : internalEle.closest(".modal"));

  modalEle.classList.remove("is-active");

};

llm.openHtmlModal = function(htmlFileName, callbackFns) {

  // eslint-disable-next-line capitalized-comments
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

      // Append the modal to the end of the body

      const modalContainerEle = document.createElement("div");
      modalContainerEle.innerHTML = modalHTML;

      const modalEle = modalContainerEle.getElementsByClassName("modal")[0];

      document.body.insertAdjacentElement("beforeend", modalContainerEle);

      // Call onshow()

      if (callbackFns && callbackFns.onshow) {

        callbackFns.onshow(modalEle);

      }

      // Show the modal

      modalEle.classList.add("is-active");

      const closeModalFn = function() {

        const modalWasShown = modalEle.classList.contains("is-active");

        if (callbackFns && callbackFns.onhide && modalWasShown) {

          const doHide = callbackFns.onhide(modalEle);

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

      // Call onshown()

      if (callbackFns && callbackFns.onshown) {

        callbackFns.onshown(modalEle, closeModalFn);

      }

      // Set up close buttons

      const closeModalBtnEles = modalEle.getElementsByClassName("is-close-modal-button");

      for (let btnIndex = 0; btnIndex < closeModalBtnEles.length; btnIndex += 1) {

        closeModalBtnEles[btnIndex].addEventListener("click", closeModalFn);

      }

    });

};


/*
 * TABS
 */

llm.initializeTabs = function(tabsListEle, callbackFns) {

  if (!tabsListEle) {

    return;

  }

  const isPanelOrMenuListTabs = tabsListEle.classList.contains("panel-tabs") || tabsListEle.classList.contains("menu-list");


  const listItemEles = tabsListEle.getElementsByTagName(isPanelOrMenuListTabs ? "a" : "li");
  const tabLinkEles = (isPanelOrMenuListTabs ? listItemEles : tabsListEle.getElementsByTagName("a"));

  function tabClickFn(clickEvent) {

    clickEvent.preventDefault();

    const tabLinkEle = clickEvent.currentTarget;
    const tabContentEle = document.getElementById(tabLinkEle.getAttribute("href").substring(1));

    for (let index = 0; index < listItemEles.length; index += 1) {

      listItemEles[index].classList.remove("is-active");
      tabLinkEles[index].setAttribute("aria-selected", "false");

    }

    // Add is-active to the selected tab
    (isPanelOrMenuListTabs ? tabLinkEle : tabLinkEle.parentNode).classList.add("is-active");
    tabLinkEle.setAttribute("aria-selected", "true");

    const tabContentEles = tabContentEle.parentNode.getElementsByClassName("tab-content");

    for (let index = 0; index < tabContentEles.length; index += 1) {

      tabContentEles[index].classList.remove("is-active");

    }

    tabContentEle.classList.add("is-active");

    if (callbackFns && callbackFns.onshown) {

      callbackFns.onshown(tabContentEle);

    }

  }

  for (let index = 0; index < listItemEles.length; index += 1) {

    (isPanelOrMenuListTabs ?
      listItemEles[index] :
      listItemEles[index].getElementsByTagName("a")[0]).addEventListener("click", tabClickFn);

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

    const contextualColorIsDark = !(contextualColorName === "warning");

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
          "<button class=\"button is-cancel-button\" type=\"button\" aria-label=\"Cancel\">" +
          cancelButtonHTML +
          "</button>") +
        ("<button class=\"button is-ok-button is-" + contextualColorName + "\" type=\"button\" aria-label=\"OK\">" +
          okButtonHTML +
          "</button>") +
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

  llm.confirmModal = function(titleString, bodyHTML, okButtonHTML, contextualColorName, callbackFn) {

    confirmModalFn({
      contextualColorName: contextualColorName,
      titleString: titleString,
      bodyHTML: bodyHTML,
      okButtonHTML: okButtonHTML,
      callbackFn: callbackFn
    });

  };

  llm.alertModal = function(titleString, bodyHTML, okButtonHTML, contextualColorName) {

    confirmModalFn({
      contextualColorName: contextualColorName,
      titleString: titleString,
      bodyHTML: bodyHTML,
      hideCancelButton: true,
      okButtonHTML: okButtonHTML
    });

  };

}());


(function() {

  /*
   * NAV BLOCKER
   */

  let isNavBlockerEnabled = false;

  function navBlockerEventFn(e) {

    const confirmationMessage = "You have unsaved changes that may be lost.";
    e.returnValue = confirmationMessage;
    return confirmationMessage;

  }

  llm.enableNavBlocker = function() {

    if (!isNavBlockerEnabled) {

      window.addEventListener("beforeunload", navBlockerEventFn);
      isNavBlockerEnabled = true;

    }

  };

  llm.disableNavBlocker = function() {

    if (isNavBlockerEnabled) {

      window.removeEventListener("beforeunload", navBlockerEventFn);
      isNavBlockerEnabled = false;

    }

  };

}());


// SIDE MENU INIT

(function() {

  const collapseButtonEle = document.getElementById("is-sidemenu-collapse-button");
  const collapseSidemenuEle = document.getElementById("is-sidemenu-collapsed");

  const expandButtonEle = document.getElementById("is-sidemenu-expand-button");
  const expandSidemenuEle = document.getElementById("is-sidemenu-expanded");

  if (collapseButtonEle && collapseSidemenuEle && expandButtonEle && expandSidemenuEle) {

    collapseButtonEle.addEventListener("click", function() {

      expandSidemenuEle.classList.add("is-hidden");
      collapseSidemenuEle.classList.remove("is-hidden");

    });

    expandButtonEle.addEventListener("click", function() {

      collapseSidemenuEle.classList.add("is-hidden");
      expandSidemenuEle.classList.remove("is-hidden");

    });

  }

}());


(function() {

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
    llm.confirmModal(
      "Log Out?",
      "<p>Are you sure you want to log out?</p>",
      "<span class=\"icon\"><i class=\"fas fa-sign-out-alt\" aria-hidden=\"true\"></i></span><span>Log Out</span>",
      "warning",
      function() {

        window.localStorage.clear();
        window.location.href = "/logout";

      }
    );

  }


  const logoutBtnEles = document.getElementsByClassName("is-logout-button");

  for (let logoutBtnIndex = 0; logoutBtnIndex < logoutBtnEles.length; logoutBtnIndex += 1) {

    logoutBtnEles[logoutBtnIndex].addEventListener("click", openLogoutModal);

  }

}());
