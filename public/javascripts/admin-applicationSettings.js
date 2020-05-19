"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    function getMessageEle(formEle) {
        return formEle.closest("tr").getElementsByClassName("formMessage")[0];
    }
    function submitFn(formEvent) {
        formEvent.preventDefault();
        var formEle = formEvent.currentTarget;
        var messageEle = getMessageEle(formEle);
        messageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";
        cityssm.postJSON("/admin/doSaveApplicationSetting", formEle, function (responseJSON) {
            if (responseJSON.success) {
                messageEle.innerHTML = "<span class=\"has-text-success\">Updated Successfully</span>";
            }
            else {
                messageEle.innerHTML = "<span class=\"has-text-danger\">Update Error</span>";
            }
        });
    }
    function changeFn(inputEvent) {
        getMessageEle(inputEvent.currentTarget).innerHTML = "<span class=\"has-text-info\">Unsaved Changes</span>";
    }
    var formEles = document.getElementsByClassName("form--applicationSetting");
    for (var formIndex = 0; formIndex < formEles.length; formIndex += 1) {
        formEles[formIndex].addEventListener("submit", submitFn);
        formEles[formIndex].getElementsByClassName("input")[0].addEventListener("change", changeFn);
    }
}());
