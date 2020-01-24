"use strict";

(function() {

  const restoreButtonEle = document.getElementById("is-location-restore-button");

  if (restoreButtonEle) {

    const restoreFn = function() {

      llm.postJSON("/locations/doRestore", {
        locationID: restoreButtonEle.getAttribute("data-location-id")
      }, function(responseJSON) {

        if (responseJSON.success) {

          window.location.reload(true);

        }

      });

    };

    restoreButtonEle.addEventListener("click", function() {

      llm.confirmModal(
        "Restore Location?",
        "Are you sure you want to restore this location, and make it available for use again?",
        "Yes, Restore",
        "warning",
        restoreFn
      );

    });

  }

}());
