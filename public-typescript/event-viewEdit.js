;
(() => {
    const eventDateSelectElement = document.querySelector('#eventNav--eventDate');
    if (eventDateSelectElement !== null) {
        eventDateSelectElement.addEventListener('change', () => {
            var _a;
            const urlPrefix = (_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.urlPrefix;
            const licenceID = eventDateSelectElement.dataset.licenceId;
            const newEventDate = eventDateSelectElement.value;
            const isEdit = eventDateSelectElement.dataset.isEdit === 'true';
            globalThis.location.href = `${urlPrefix}/events/${licenceID}/${newEventDate}${isEdit ? '/edit' : ''}`;
        });
    }
})();
