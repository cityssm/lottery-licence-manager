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


  /*
   * BULMA CALENDAR DEFAULT OPTIONS
   */

  window.llm.bulmaCalendarOptions = {
    showHeader: false,
    showFooter: false,
    enableYearSwitch: false,

    dateFormat: "YYYY/MM/DD",
    //disabledWeekDays: [0, 6],
    color: "link",
    icons: {
      previous: "<i class=\"fas fa-chevron-left\"></i>",
      next: "<i class=\"fas fa-chevron-right\"></i>",
      date: "<i class=\"fas fa-calendar\"></i>"
    }
  };

  window.llm.bulmaTimeOptions = {
    displayMode: "inline",
    showHeader: false,
    showFooter: true,
    //enableYearSwitch: false,

    dateFormat: "YYYY/MM/DD",
    startDate: "1970/01/01",
    endDate: "1970/01/01",

    timeFormat: "HH:mm",
    color: "link",

    onReady: function(readyEvent) {

      console.log(readyEvent.data);

      const ele = readyEvent.data.element;

      let startTimeString = ele.getAttribute("data-start-time").split(":");

      if (startTimeString.length >= 2) {
        const startTime = new Date();
        startTime.setHours(startTimeString[0]);
        startTime.setMinutes(startTimeString[1]);
        readyEvent.data.timePicker.start = startTime;
      }

      let endTimeString = ele.getAttribute("data-end-time").split(":");

      if (endTimeString.length >= 2) {
        const endTime = new Date();
        endTime.setHours(endTimeString[0]);
        endTime.setMinutes(endTimeString[1]);
        readyEvent.data.timePicker.end = endTime;
      }

      readyEvent.data.timePicker.refresh();

    }
  };


  window.llm.fixBulmaCalendars = function(scopeEle) {

    if (!scopeEle) {
      scopeEle = document;
    }

    // fix clear buttons

    const bulmaClearButtonEles = scopeEle.getElementsByClassName("datetimepicker-clear-button");

    for (let eleIndex = 0; eleIndex < bulmaClearButtonEles.length; eleIndex += 1) {
      bulmaClearButtonEles[eleIndex].setAttribute("type", "button");
    }

    // fix next and previous month buttons

    const bulmaNavButtonEles = scopeEle.querySelectorAll(".datepicker-nav-previous, .datepicker-nav-next");

    for (let eleIndex = 0; eleIndex < bulmaNavButtonEles.length; eleIndex += 1) {
      bulmaNavButtonEles[eleIndex].classList.remove("is-text");
      bulmaNavButtonEles[eleIndex].classList.add("is-" + window.llm.bulmaCalendarOptions.color);
    }
  };


  window.llm.fixBulmaTimes = function(scopeEle) {

    if (!scopeEle) {
      scopeEle = document;
    }

    // fix next and previous month buttons

    const bulmaInputEles = scopeEle.querySelectorAll(".timepicker-input-number, .timepicker-time-divider");

    for (let eleIndex = 0; eleIndex < bulmaInputEles.length; eleIndex += 1) {
      bulmaInputEles[eleIndex].classList.add("has-text-" + window.llm.bulmaTimeOptions.color);
    }
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

  window.llm.confirmModal = function(titleString, bodyHTML, okButtonHTML, contextualColorName, callbackFn) {

    const modalEle = document.createElement("div");
    modalEle.className = "modal is-active";

    modalEle.innerHTML = "<div class=\"modal-background\"></div>" +
      "<div class=\"modal-card\">" +
      ("<header class=\"modal-card-head has-background-" + contextualColorName + "\">" +
        "<h3 class=\"modal-card-title\"></h3>" +
        "</header>") +
      ("<section class=\"modal-card-body\">" + bodyHTML + "</section>") +
      ("<footer class=\"modal-card-foot justify-right\">" +
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
