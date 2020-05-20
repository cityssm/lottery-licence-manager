"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var restoreButtonEle = document.getElementById("is-location-restore-button");
    if (restoreButtonEle) {
        var restoreFn_1 = function () {
            cityssm.postJSON("/locations/doRestore", {
                locationID: restoreButtonEle.getAttribute("data-location-id")
            }, function (responseJSON) {
                if (responseJSON.success) {
                    window.location.reload(true);
                }
            });
        };
        restoreButtonEle.addEventListener("click", function () {
            cityssm.confirmModal("Restore Location?", "Are you sure you want to restore this location, and make it available for use again?", "Yes, Restore", "warning", restoreFn_1);
        });
    }
}());
