"use strict";

(function() {

  if (document.getElementsByTagName("main")[0].getAttribute("data-can-update") === "true") {

    const restoreButtonEles = document.getElementsByClassName("is-restore-organization-button");

    if (restoreButtonEles.length > 0) {

      const buttonEle = restoreButtonEles[0];

      const organizationID = buttonEle.getAttribute("data-organization-id");

      const restoreFn = function() {

        llm.postJSON(
          "/organizations/doRestore", {
            organizationID: organizationID
          },
          function(responseJSON) {

            if (responseJSON.success) {

              window.location.href = "/organizations/" + organizationID + "?_" + Date.now();

            }

          }
        );

      };

      buttonEle.addEventListener("click", function() {

        const organizationName = buttonEle.getAttribute("data-organization-name");

        llm.confirmModal(
          "Restore " + organizationName + "?",
          "Are you sure you want to restore this organization?",
          "Yes, Restore",
          "warning",
          restoreFn
        );

      });

    }

  }

}());
