"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const urlPrefix = document.querySelector('main').dataset
        .urlPrefix;
    function getMessageElement(formElement) {
        var _a;
        return (_a = formElement
            .closest('tr')) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.formMessage').item(0);
    }
    function submitFunction(formEvent) {
        formEvent.preventDefault();
        const formElement = formEvent.currentTarget;
        const messageElement = getMessageElement(formElement);
        messageElement.innerHTML =
            'Saving... <i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i>';
        cityssm.postJSON(`${urlPrefix}/admin/doSaveApplicationSetting`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            messageElement.innerHTML = responseJSON.success
                ? '<span class="has-text-success">Updated Successfully</span>'
                : '<span class="has-text-danger">Update Error</span>';
        });
    }
    function changeFunction(inputEvent) {
        getMessageElement(inputEvent.currentTarget).innerHTML =
            '<span class="has-text-info">Unsaved Changes</span>';
    }
    const formElements = document.querySelectorAll('.form--applicationSetting');
    for (const formElement of formElements) {
        formElement.addEventListener('submit', submitFunction);
        formElement
            .querySelectorAll('.input')
            .item(0)
            .addEventListener('change', changeFunction);
    }
})();
