"use strict";

(function() {

  const eventDateNavEle = document.getElementById("eventNav--eventDate");

  const formEle = document.getElementById("form--event");
  const formMessageEle = document.getElementById("container--form-message");

  const licenceID = document.getElementById("event--licenceID").value;
  const eventDate = document.getElementById("event--eventDate").value;


  formEle.addEventListener("submit", function(formEvent) {

    formEvent.preventDefault();

    formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    cityssm.postJSON(
      "/events/doSave",
      formEle,
      function(responseJSON) {

        if (responseJSON.success) {

          cityssm.disableNavBlocker();
          eventDateNavEle.removeAttribute("disabled");

        }

        formMessageEle.innerHTML = "";

        cityssm.alertModal(
          responseJSON.message,
          "",
          "OK",
          responseJSON.success ? "success" : "danger"
        );

      }
    );

  });

  document.getElementById("is-delete-event-button").addEventListener("click", function(clickEvent) {

    clickEvent.preventDefault();

    cityssm.confirmModal(
      "Delete Event?",
      "Are you sure you want to delete this event?",
      "Yes, Delete",
      "danger",
      function() {

        cityssm.postJSON(
          "/events/doDelete", {
            licenceID: licenceID,
            eventDate: eventDate
          },
          function(responseJSON) {

            if (responseJSON.success) {

              cityssm.disableNavBlocker();
              window.location.href = "/licences/" + licenceID;

            }

          }
        );

      }
    );

  });


  // Nav blocker

  function setUnsavedChanges() {

    cityssm.enableNavBlocker();
    eventDateNavEle.setAttribute("disabled", "disabled");

    formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";

  }

  const inputEles = formEle.querySelectorAll("input, select, textarea");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {

    if (inputEles[inputIndex].name !== "") {

      inputEles[inputIndex].addEventListener("change", setUnsavedChanges);

    }

  }


  // Bank Info Lookup


  document.getElementById("is-bank-information-lookup-button").addEventListener("click", function(clickEvent) {

    clickEvent.preventDefault();

    let bankInfoCloseModalFn;
    let savedBankInfoList;

    const setPastBankInformation = function(bankInfoClickEvent) {

      bankInfoClickEvent.preventDefault();

      const listIndex = parseInt(bankInfoClickEvent.currentTarget.getAttribute("data-list-index"));

      const record = savedBankInfoList[listIndex];

      document.getElementById("event--bank_name").value = record.bank_name;
      document.getElementById("event--bank_address").value = record.bank_address;
      document.getElementById("event--bank_accountNumber").value = record.bank_accountNumber;

      setUnsavedChanges();

      bankInfoCloseModalFn();

    };

    const getPastBankInformation = function() {

      const containerEle = document.getElementById("container--bankInformationLookup");

      cityssm.postJSON("/events/doGetPastBankInformation", {
        licenceID: licenceID
      }, function(bankInfoList) {

        savedBankInfoList = bankInfoList;

        const listEle = document.createElement("div");
        listEle.className = "list is-hoverable has-margin-bottom-10";

        for (let index = 0; index < bankInfoList.length; index += 1) {

          const record = bankInfoList[index];

          const listItemEle = document.createElement("a");

          listItemEle.className = "list-item";
          listItemEle.setAttribute("data-list-index", index);

          listItemEle.innerHTML = "<div class=\"columns\">" +
            "<div class=\"column\">" + cityssm.escapeHTML(record.bank_name) + "</div>" +
            "<div class=\"column\">" + cityssm.escapeHTML(record.bank_address) + "</div>" +
            "<div class=\"column\">" + cityssm.escapeHTML(record.bank_accountNumber) + "</div>" +
            "</div>" +
            "<div class=\"has-text-right\">" +
            "<span class=\"tag is-info\" data-tooltip=\"Last Used Event Date\">" +
            record.eventDateMaxString +
            "</span>" +
            "</div>";

          listItemEle.addEventListener("click", setPastBankInformation);

          listEle.insertAdjacentElement("beforeend", listItemEle);

        }

        cityssm.clearElement(containerEle);

        containerEle.insertAdjacentElement("beforeend", listEle);

      });

    };

    cityssm.openHtmlModal("event-bankInformationLookup", {

      onshow: getPastBankInformation,

      onshown: function(modalEle, closeModalFn) {

        bankInfoCloseModalFn = closeModalFn;

      }
    });

  });


}());
