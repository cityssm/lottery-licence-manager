"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    if (document.getElementsByTagName("main")[0].getAttribute("data-can-update") === "true") {
        var restoreButtonEles = document.getElementsByClassName("is-restore-organization-button");
        if (restoreButtonEles.length > 0) {
            var buttonEle_1 = restoreButtonEles[0];
            var organizationID_1 = buttonEle_1.getAttribute("data-organization-id");
            var restoreFn_1 = function () {
                cityssm.postJSON("/organizations/doRestore", {
                    organizationID: organizationID_1
                }, function (responseJSON) {
                    if (responseJSON.success) {
                        window.location.href = "/organizations/" + organizationID_1 + "?_" + Date.now();
                    }
                });
            };
            buttonEle_1.addEventListener("click", function () {
                var organizationName = buttonEle_1.getAttribute("data-organization-name");
                cityssm.confirmModal("Restore " + organizationName + "?", "Are you sure you want to restore this organization?", "Yes, Restore", "warning", restoreFn_1);
            });
        }
    }
}());
