"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    const restoreButtonEle = document.getElementById("is-location-restore-button");
    if (restoreButtonEle) {
        const restoreFn = function () {
            cityssm.postJSON("/locations/doRestore", {
                locationID: restoreButtonEle.getAttribute("data-location-id")
            }, function (responseJSON) {
                if (responseJSON.success) {
                    window.location.reload(true);
                }
            });
        };
        restoreButtonEle.addEventListener("click", function () {
            cityssm.confirmModal("Restore Location?", "Are you sure you want to restore this location, and make it available for use again?", "Yes, Restore", "warning", restoreFn);
        });
    }
}());
