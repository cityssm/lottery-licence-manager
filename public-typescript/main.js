"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    function arrayToObject(array, objectKey) {
        const object = {};
        for (const arrayEntry of array) {
            object[arrayEntry[objectKey]] = arrayEntry;
        }
        return object;
    }
    function formatDollarsAsHTML(dollarAmt) {
        return dollarAmt < 0
            ? `<span class="has-text-danger">($${(dollarAmt * -1).toFixed(2)})</span>`
            : '$' + dollarAmt.toFixed(2);
    }
    function initializeDateRangeSelector(containerElement, changeFunction) {
        var _a, _b, _c, _d;
        const rangeTypeSelectElement = (_a = containerElement
            .querySelector("[data-field='rangeType']")) === null || _a === void 0 ? void 0 : _a.querySelector('select');
        const rangeSelectElement = (_b = containerElement
            .querySelector("[data-field='range']")) === null || _b === void 0 ? void 0 : _b.querySelector('select');
        const dateOptionElement = rangeSelectElement === null || rangeSelectElement === void 0 ? void 0 : rangeSelectElement.querySelector("[data-range-type='']");
        const yearOptgroupElement = rangeSelectElement === null || rangeSelectElement === void 0 ? void 0 : rangeSelectElement.querySelector("[data-range-type='year']");
        const quarterOptgroupElement = rangeSelectElement === null || rangeSelectElement === void 0 ? void 0 : rangeSelectElement.querySelector("[data-range-type='quarter']");
        const monthOptgroupElement = rangeSelectElement === null || rangeSelectElement === void 0 ? void 0 : rangeSelectElement.querySelector("[data-range-type='month']");
        const startDateElement = (_c = containerElement
            .querySelector("[data-field='start']")) === null || _c === void 0 ? void 0 : _c.querySelector('input');
        const endDateElement = (_d = containerElement
            .querySelector("[data-field='end']")) === null || _d === void 0 ? void 0 : _d.querySelector('input');
        const setStartEndDatesFromRangeFunction = () => {
            const rangeValue = rangeSelectElement.value;
            if (rangeValue === '') {
                return;
            }
            let startDateString = '';
            let endDateString = '';
            const range = rangeValue.split('-');
            if (range.length === 1) {
                startDateString = `${range[0]}-01-01`;
                endDateString = `${range[0]}-12-31`;
            }
            else if (range[1] === 'q') {
                const jsQuarterStartMonth = (Number.parseInt(range[2], 10) - 1) * 3;
                startDateString =
                    range[0] +
                        '-' +
                        ('0' + (jsQuarterStartMonth + 1).toString()).slice(-2) +
                        '-01';
                const endDate = new Date(Number.parseInt(range[0], 10), jsQuarterStartMonth + 3, 0);
                endDateString =
                    range[0] +
                        '-' +
                        ('0' + (endDate.getMonth() + 1).toString()).slice(-2) +
                        '-' +
                        endDate.getDate().toString();
            }
            else {
                const jsQuarterStartMonth = Number.parseInt(range[1], 10) - 1;
                startDateString =
                    range[0] +
                        '-' +
                        ('0' + (jsQuarterStartMonth + 1).toString()).slice(-2) +
                        '-01';
                const endDate = new Date(Number.parseInt(range[0], 10), jsQuarterStartMonth + 1, 0);
                endDateString =
                    range[0] +
                        '-' +
                        ('0' + (endDate.getMonth() + 1).toString()).slice(-2) +
                        '-' +
                        endDate.getDate().toString();
            }
            startDateElement.value = startDateString;
            endDateElement.setAttribute('min', startDateString);
            endDateElement.value = endDateString;
            if (changeFunction) {
                changeFunction();
            }
        };
        rangeTypeSelectElement === null || rangeTypeSelectElement === void 0 ? void 0 : rangeTypeSelectElement.addEventListener('change', () => {
            const rangeType = rangeTypeSelectElement.value;
            if (rangeType === '') {
                rangeSelectElement === null || rangeSelectElement === void 0 ? void 0 : rangeSelectElement.setAttribute('readonly', 'readonly');
                rangeSelectElement === null || rangeSelectElement === void 0 ? void 0 : rangeSelectElement.classList.add('is-readonly');
                dateOptionElement === null || dateOptionElement === void 0 ? void 0 : dateOptionElement.classList.remove('is-hidden');
                yearOptgroupElement.classList.add('is-hidden');
                quarterOptgroupElement.classList.add('is-hidden');
                monthOptgroupElement.classList.add('is-hidden');
                rangeSelectElement.value = '';
                startDateElement === null || startDateElement === void 0 ? void 0 : startDateElement.removeAttribute('readonly');
                startDateElement === null || startDateElement === void 0 ? void 0 : startDateElement.classList.remove('is-readonly');
                endDateElement === null || endDateElement === void 0 ? void 0 : endDateElement.removeAttribute('readonly');
                endDateElement === null || endDateElement === void 0 ? void 0 : endDateElement.classList.remove('is-readonly');
            }
            else {
                rangeSelectElement === null || rangeSelectElement === void 0 ? void 0 : rangeSelectElement.removeAttribute('readonly');
                rangeSelectElement === null || rangeSelectElement === void 0 ? void 0 : rangeSelectElement.classList.remove('is-readonly');
                if (rangeType === 'year') {
                    yearOptgroupElement.classList.remove('is-hidden');
                    rangeSelectElement.value = yearOptgroupElement.children[0].value;
                }
                else {
                    yearOptgroupElement.classList.add('is-hidden');
                }
                if (rangeType === 'quarter') {
                    quarterOptgroupElement.classList.remove('is-hidden');
                    rangeSelectElement.value = quarterOptgroupElement.children[0].value;
                }
                else {
                    quarterOptgroupElement.classList.add('is-hidden');
                }
                if (rangeType === 'month') {
                    monthOptgroupElement.classList.remove('is-hidden');
                    rangeSelectElement.value = monthOptgroupElement.children[0].value;
                }
                else {
                    monthOptgroupElement.classList.add('is-hidden');
                }
                dateOptionElement.classList.add('is-hidden');
                startDateElement.setAttribute('readonly', 'readonly');
                startDateElement.classList.add('is-readonly');
                endDateElement.setAttribute('readonly', 'readonly');
                endDateElement.classList.add('is-readonly');
                setStartEndDatesFromRangeFunction();
            }
        });
        rangeSelectElement === null || rangeSelectElement === void 0 ? void 0 : rangeSelectElement.addEventListener('change', setStartEndDatesFromRangeFunction);
        startDateElement === null || startDateElement === void 0 ? void 0 : startDateElement.addEventListener('change', () => {
            endDateElement === null || endDateElement === void 0 ? void 0 : endDateElement.setAttribute('min', startDateElement.value);
            changeFunction();
        });
        endDateElement === null || endDateElement === void 0 ? void 0 : endDateElement.addEventListener('change', changeFunction);
    }
    function getDefaultConfigProperty(propertyName, propertyValueCallbackFunction) {
        var _a;
        try {
            const defaultConfigPropertiesString = globalThis.localStorage.getItem('defaultConfigProperties');
            if (defaultConfigPropertiesString) {
                const defaultConfigProperties = JSON.parse(defaultConfigPropertiesString);
                propertyValueCallbackFunction(defaultConfigProperties[propertyName]);
                return;
            }
        }
        catch (_b) {
        }
        const urlPrefix = (_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.urlPrefix;
        cityssm.postJSON(`${urlPrefix}/dashboard/doGetDefaultConfigProperties`, {}, (defaultConfigProperties) => {
            try {
                globalThis.localStorage.setItem('defaultConfigProperties', JSON.stringify(defaultConfigProperties));
            }
            catch (_a) {
            }
            propertyValueCallbackFunction(defaultConfigProperties[propertyName]);
        });
    }
    function initializeTabs(tabsListElement, callbackFunctions) {
        var _a;
        if (!tabsListElement) {
            return;
        }
        const isPanelOrMenuListTabs = tabsListElement.classList.contains('panel-tabs') ||
            tabsListElement.classList.contains('menu-list');
        const listItemElements = tabsListElement.querySelectorAll(isPanelOrMenuListTabs ? 'a' : 'li');
        const tabLinkElements = (isPanelOrMenuListTabs
            ? listItemElements
            : tabsListElement.querySelectorAll('a'));
        const tabClickFunction = (clickEvent) => {
            var _a;
            clickEvent.preventDefault();
            const tabLinkElement = clickEvent.currentTarget;
            const selectedTabContentElement = document.querySelector(tabLinkElement.getAttribute('href'));
            for (const [index, listItemElement] of listItemElements.entries()) {
                listItemElement.classList.remove('is-active');
                tabLinkElements[index].setAttribute('aria-selected', 'false');
            }
            ;
            (isPanelOrMenuListTabs
                ? tabLinkElement
                : tabLinkElement.parentElement).classList.add('is-active');
            tabLinkElement.setAttribute('aria-selected', 'true');
            const allTabContentElements = (_a = selectedTabContentElement.parentElement) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.tab-content');
            for (const tabContentElement of allTabContentElements) {
                tabContentElement.classList.remove('is-active');
            }
            selectedTabContentElement.classList.add('is-active');
            if (callbackFunctions === null || callbackFunctions === void 0 ? void 0 : callbackFunctions.onshown) {
                callbackFunctions.onshown(selectedTabContentElement);
            }
        };
        for (const listItemElement of listItemElements) {
            ;
            (_a = (isPanelOrMenuListTabs
                ? listItemElement
                : listItemElement.querySelector('a'))) === null || _a === void 0 ? void 0 : _a.addEventListener('click', tabClickFunction);
        }
    }
    const llm = {
        arrayToObject,
        formatDollarsAsHTML,
        getDefaultConfigProperty,
        initializeDateRangeSelector,
        initializeTabs
    };
    globalThis.llm = llm;
})();
