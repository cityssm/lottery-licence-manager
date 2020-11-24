"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");
    const getMessageEle = (formEle) => {
        return formEle.closest("tr").getElementsByClassName("formMessage")[0];
    };
    const submitFn = (formEvent) => {
        formEvent.preventDefault();
        const formEle = formEvent.currentTarget;
        const messageEle = getMessageEle(formEle);
        messageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";
        cityssm.postJSON(urlPrefix + "/admin/doSaveApplicationSetting", formEle, (responseJSON) => {
            if (responseJSON.success) {
                messageEle.innerHTML = "<span class=\"has-text-success\">Updated Successfully</span>";
            }
            else {
                messageEle.innerHTML = "<span class=\"has-text-danger\">Update Error</span>";
            }
        });
    };
    const changeFn = (inputEvent) => {
        getMessageEle(inputEvent.currentTarget).innerHTML =
            "<span class=\"has-text-info\">Unsaved Changes</span>";
    };
    const formEles = document.getElementsByClassName("form--applicationSetting");
    for (const formEle of formEles) {
        formEle.addEventListener("submit", submitFn);
        formEle.getElementsByClassName("input")[0].addEventListener("change", changeFn);
    }
})();
