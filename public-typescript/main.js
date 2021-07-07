"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const llm = {};
llm.arrayToObject = (array, objectKey) => {
    const object = {};
    for (const arrayEntry of array) {
        object[arrayEntry[objectKey]] = arrayEntry;
    }
    return object;
};
llm.formatDollarsAsHTML = (dollarAmt) => {
    return dollarAmt < 0
        ? "<span class=\"has-text-danger\">($" + (dollarAmt * -1).toFixed(2) + ")</span>"
        : "$" + dollarAmt.toFixed(2);
};
llm.initializeDateRangeSelector = (containerElement, changeFunction) => {
    const rangeTypeSelectElement = containerElement.querySelector("[data-field='rangeType']").querySelector("select");
    const rangeSelectElement = containerElement.querySelector("[data-field='range']").querySelector("select");
    const dateOptionElement = rangeSelectElement.querySelector("[data-range-type='']");
    const yearOptgroupElement = rangeSelectElement.querySelector("[data-range-type='year']");
    const quarterOptgroupElement = rangeSelectElement.querySelector("[data-range-type='quarter']");
    const monthOptgroupElement = rangeSelectElement.querySelector("[data-range-type='month']");
    const startDateElement = containerElement.querySelector("[data-field='start']").querySelector("input");
    const endDateElement = containerElement.querySelector("[data-field='end']").querySelector("input");
    const setStartEndDatesFromRangeFunction = () => {
        const rangeValue = rangeSelectElement.value;
        if (rangeValue === "") {
            return;
        }
        let startDateString = "";
        let endDateString = "";
        const range = rangeValue.split("-");
        if (range.length === 1) {
            startDateString = range[0] + "-01-01";
            endDateString = range[0] + "-12-31";
        }
        else if (range[1] === "q") {
            const jsQuarterStartMonth = (Number.parseInt(range[2], 10) - 1) * 3;
            startDateString = range[0] + "-" + ("0" + (jsQuarterStartMonth + 1).toString()).slice(-2) + "-01";
            const endDate = new Date(Number.parseInt(range[0], 10), jsQuarterStartMonth + 3, 0);
            endDateString = range[0] + "-" +
                ("0" + (endDate.getMonth() + 1).toString()).slice(-2) + "-" +
                endDate.getDate().toString();
        }
        else {
            const jsQuarterStartMonth = (Number.parseInt(range[1], 10) - 1);
            startDateString = range[0] + "-" + ("0" + (jsQuarterStartMonth + 1).toString()).slice(-2) + "-01";
            const endDate = new Date(Number.parseInt(range[0], 10), jsQuarterStartMonth + 1, 0);
            endDateString = range[0] + "-" +
                ("0" + (endDate.getMonth() + 1).toString()).slice(-2) + "-" +
                endDate.getDate().toString();
        }
        startDateElement.value = startDateString;
        endDateElement.setAttribute("min", startDateString);
        endDateElement.value = endDateString;
        if (changeFunction) {
            changeFunction();
        }
    };
    rangeTypeSelectElement.addEventListener("change", () => {
        const rangeType = rangeTypeSelectElement.value;
        if (rangeType === "") {
            rangeSelectElement.setAttribute("readonly", "readonly");
            rangeSelectElement.classList.add("is-readonly");
            dateOptionElement.classList.remove("is-hidden");
            yearOptgroupElement.classList.add("is-hidden");
            quarterOptgroupElement.classList.add("is-hidden");
            monthOptgroupElement.classList.add("is-hidden");
            rangeSelectElement.value = "";
            startDateElement.removeAttribute("readonly");
            startDateElement.classList.remove("is-readonly");
            endDateElement.removeAttribute("readonly");
            endDateElement.classList.remove("is-readonly");
        }
        else {
            rangeSelectElement.removeAttribute("readonly");
            rangeSelectElement.classList.remove("is-readonly");
            if (rangeType === "year") {
                yearOptgroupElement.classList.remove("is-hidden");
                rangeSelectElement.value = yearOptgroupElement.children[0].value;
            }
            else {
                yearOptgroupElement.classList.add("is-hidden");
            }
            if (rangeType === "quarter") {
                quarterOptgroupElement.classList.remove("is-hidden");
                rangeSelectElement.value = quarterOptgroupElement.children[0].value;
            }
            else {
                quarterOptgroupElement.classList.add("is-hidden");
            }
            if (rangeType === "month") {
                monthOptgroupElement.classList.remove("is-hidden");
                rangeSelectElement.value = monthOptgroupElement.children[0].value;
            }
            else {
                monthOptgroupElement.classList.add("is-hidden");
            }
            dateOptionElement.classList.add("is-hidden");
            startDateElement.setAttribute("readonly", "readonly");
            startDateElement.classList.add("is-readonly");
            endDateElement.setAttribute("readonly", "readonly");
            endDateElement.classList.add("is-readonly");
            setStartEndDatesFromRangeFunction();
        }
    });
    rangeSelectElement.addEventListener("change", setStartEndDatesFromRangeFunction);
    startDateElement.addEventListener("change", () => {
        endDateElement.setAttribute("min", startDateElement.value);
        changeFunction();
    });
    endDateElement.addEventListener("change", changeFunction);
};
llm.getDefaultConfigProperty = (propertyName, propertyValueCallbackFunction) => {
    try {
        const defaultConfigPropertiesString = window.localStorage.getItem("defaultConfigProperties");
        if (defaultConfigPropertiesString) {
            const defaultConfigProperties = JSON.parse(defaultConfigPropertiesString);
            propertyValueCallbackFunction(defaultConfigProperties[propertyName]);
            return;
        }
    }
    catch (_a) {
    }
    const urlPrefix = document.querySelector("main").dataset.urlPrefix;
    cityssm.postJSON(urlPrefix + "/dashboard/doGetDefaultConfigProperties", {}, (defaultConfigProperties) => {
        try {
            window.localStorage.setItem("defaultConfigProperties", JSON.stringify(defaultConfigProperties));
        }
        catch (_a) {
        }
        propertyValueCallbackFunction(defaultConfigProperties[propertyName]);
    });
};
llm.initializeTabs = (tabsListElement, callbackFunctions) => {
    if (!tabsListElement) {
        return;
    }
    const isPanelOrMenuListTabs = tabsListElement.classList.contains("panel-tabs") || tabsListElement.classList.contains("menu-list");
    const listItemElements = tabsListElement.querySelectorAll(isPanelOrMenuListTabs ? "a" : "li");
    const tabLinkElements = (isPanelOrMenuListTabs ? listItemElements : tabsListElement.querySelectorAll("a"));
    const tabClickFunction = (clickEvent) => {
        clickEvent.preventDefault();
        const tabLinkElement = clickEvent.currentTarget;
        const selectedTabContentElement = document.querySelector(tabLinkElement.getAttribute("href"));
        for (const [index, listItemElement] of listItemElements.entries()) {
            listItemElement.classList.remove("is-active");
            tabLinkElements[index].setAttribute("aria-selected", "false");
        }
        (isPanelOrMenuListTabs ? tabLinkElement : tabLinkElement.parentElement).classList.add("is-active");
        tabLinkElement.setAttribute("aria-selected", "true");
        const allTabContentElements = selectedTabContentElement.parentElement.querySelectorAll(".tab-content");
        for (const tabContentElement of allTabContentElements) {
            tabContentElement.classList.remove("is-active");
        }
        selectedTabContentElement.classList.add("is-active");
        if (callbackFunctions === null || callbackFunctions === void 0 ? void 0 : callbackFunctions.onshown) {
            callbackFunctions.onshown(selectedTabContentElement);
        }
    };
    for (const listItemElement of listItemElements) {
        (isPanelOrMenuListTabs
            ? listItemElement
            : listItemElement.querySelector("a")).addEventListener("click", tabClickFunction);
    }
};
