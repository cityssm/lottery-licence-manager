/* global window, document */


(function() {
  "use strict";

  if (document.getElementsByTagName("main")[0].getAttribute("data-can-update") === "true") {

    const restoreButtonEles = document.getElementsByClassName("is-restore-organization-button");

    if (restoreButtonEles.length > 0) {

      const buttonEle = restoreButtonEles[0];

      const organizationID = buttonEle.getAttribute("data-organization-id");

      const restoreFn = function() {

        window.fetch("/organizations/doRestore", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              organizationID: organizationID
            })
          })
          .then(function(response) {
            return response.json();
          })
          .then(function(responseJSON) {
            if (responseJSON.success) {
              window.location.href = "/organizations/" + organizationID + "?_" + Date.now();
            }
          });
      };

      buttonEle.addEventListener("click", function() {

        const organizationName = buttonEle.getAttribute("data-organization-name");

        window.llm.confirmModal("Restore " + organizationName + "?",
          "Are you sure you want to restore this organization?",
          "Yes, Restore",
          "warning",
          restoreFn);
      });
    }
  }
}());
