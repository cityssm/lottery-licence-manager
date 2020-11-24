"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const llm = {};
llm.arrayToObject = (array, objectKey) => {
    const obj = {};
    for (const arrayEntry of array) {
        obj[arrayEntry[objectKey]] = arrayEntry;
    }
    return obj;
};
llm.initializeDateRangeSelector = (containerEle, changeFn) => {
    const rangeTypeSelectEle = containerEle.querySelector("[data-field='rangeType']").getElementsByTagName("select")[0];
    const rangeSelectEle = containerEle.querySelector("[data-field='range']").getElementsByTagName("select")[0];
    const dateOptionEle = rangeSelectEle.querySelector("[data-range-type='']");
    const yearOptgroupEle = rangeSelectEle.querySelector("[data-range-type='year']");
    const quarterOptgroupEle = rangeSelectEle.querySelector("[data-range-type='quarter']");
    const monthOptgroupEle = rangeSelectEle.querySelector("[data-range-type='month']");
    const startDateEle = containerEle.querySelector("[data-field='start']").getElementsByTagName("input")[0];
    const endDateEle = containerEle.querySelector("[data-field='end']").getElementsByTagName("input")[0];
    const setStartEndDatesFromRangeFn = () => {
        const rangeValue = rangeSelectEle.value;
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
            const jsQuarterStartMonth = (parseInt(range[2], 10) - 1) * 3;
            startDateString = range[0] + "-" + ("0" + (jsQuarterStartMonth + 1).toString()).slice(-2) + "-01";
            const endDate = new Date(parseInt(range[0], 10), jsQuarterStartMonth + 3, 0);
            endDateString = range[0] + "-" +
                ("0" + (endDate.getMonth() + 1).toString()).slice(-2) + "-" +
                endDate.getDate().toString();
        }
        else {
            const jsQuarterStartMonth = (parseInt(range[1], 10) - 1);
            startDateString = range[0] + "-" + ("0" + (jsQuarterStartMonth + 1).toString()).slice(-2) + "-01";
            const endDate = new Date(parseInt(range[0], 10), jsQuarterStartMonth + 1, 0);
            endDateString = range[0] + "-" +
                ("0" + (endDate.getMonth() + 1).toString()).slice(-2) + "-" +
                endDate.getDate().toString();
        }
        startDateEle.value = startDateString;
        endDateEle.setAttribute("min", startDateString);
        endDateEle.value = endDateString;
        if (changeFn) {
            changeFn();
        }
    };
    rangeTypeSelectEle.addEventListener("change", () => {
        const rangeType = rangeTypeSelectEle.value;
        if (rangeType === "") {
            rangeSelectEle.setAttribute("readonly", "readonly");
            rangeSelectEle.classList.add("is-readonly");
            dateOptionEle.classList.remove("is-hidden");
            yearOptgroupEle.classList.add("is-hidden");
            quarterOptgroupEle.classList.add("is-hidden");
            monthOptgroupEle.classList.add("is-hidden");
            rangeSelectEle.value = "";
            startDateEle.removeAttribute("readonly");
            startDateEle.classList.remove("is-readonly");
            endDateEle.removeAttribute("readonly");
            endDateEle.classList.remove("is-readonly");
        }
        else {
            rangeSelectEle.removeAttribute("readonly");
            rangeSelectEle.classList.remove("is-readonly");
            if (rangeType === "year") {
                yearOptgroupEle.classList.remove("is-hidden");
                rangeSelectEle.value = yearOptgroupEle.children[0].value;
            }
            else {
                yearOptgroupEle.classList.add("is-hidden");
            }
            if (rangeType === "quarter") {
                quarterOptgroupEle.classList.remove("is-hidden");
                rangeSelectEle.value = quarterOptgroupEle.children[0].value;
            }
            else {
                quarterOptgroupEle.classList.add("is-hidden");
            }
            if (rangeType === "month") {
                monthOptgroupEle.classList.remove("is-hidden");
                rangeSelectEle.value = monthOptgroupEle.children[0].value;
            }
            else {
                monthOptgroupEle.classList.add("is-hidden");
            }
            dateOptionEle.classList.add("is-hidden");
            startDateEle.setAttribute("readonly", "readonly");
            startDateEle.classList.add("is-readonly");
            endDateEle.setAttribute("readonly", "readonly");
            endDateEle.classList.add("is-readonly");
            setStartEndDatesFromRangeFn();
        }
    });
    rangeSelectEle.addEventListener("change", setStartEndDatesFromRangeFn);
    startDateEle.addEventListener("change", () => {
        endDateEle.setAttribute("min", startDateEle.value);
        changeFn();
    });
    endDateEle.addEventListener("change", changeFn);
};
llm.getDefaultConfigProperty = (propertyName, propertyValueCallbackFn) => {
    try {
        const defaultConfigPropertiesString = window.localStorage.getItem("defaultConfigProperties");
        if (defaultConfigPropertiesString) {
            const defaultConfigProperties = JSON.parse(defaultConfigPropertiesString);
            propertyValueCallbackFn(defaultConfigProperties[propertyName]);
            return;
        }
    }
    catch (_e) {
    }
    const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");
    cityssm.postJSON(urlPrefix + "/dashboard/doGetDefaultConfigProperties", {}, (defaultConfigProperties) => {
        try {
            window.localStorage.setItem("defaultConfigProperties", JSON.stringify(defaultConfigProperties));
        }
        catch (_e) {
        }
        propertyValueCallbackFn(defaultConfigProperties[propertyName]);
    });
};
llm.initializeTabs = (tabsListEle, callbackFns) => {
    if (!tabsListEle) {
        return;
    }
    const isPanelOrMenuListTabs = tabsListEle.classList.contains("panel-tabs") || tabsListEle.classList.contains("menu-list");
    const listItemEles = tabsListEle.getElementsByTagName(isPanelOrMenuListTabs ? "a" : "li");
    const tabLinkEles = (isPanelOrMenuListTabs ? listItemEles : tabsListEle.getElementsByTagName("a"));
    const tabClickFn = (clickEvent) => {
        clickEvent.preventDefault();
        const tabLinkEle = clickEvent.currentTarget;
        const tabContentEle = document.getElementById(tabLinkEle.getAttribute("href").substring(1));
        for (let index = 0; index < listItemEles.length; index += 1) {
            listItemEles[index].classList.remove("is-active");
            tabLinkEles[index].setAttribute("aria-selected", "false");
        }
        (isPanelOrMenuListTabs ? tabLinkEle : tabLinkEle.parentElement).classList.add("is-active");
        tabLinkEle.setAttribute("aria-selected", "true");
        const tabContentEles = tabContentEle.parentElement.getElementsByClassName("tab-content");
        for (const tabContentEle of tabContentEles) {
            tabContentEle.classList.remove("is-active");
        }
        tabContentEle.classList.add("is-active");
        if (callbackFns === null || callbackFns === void 0 ? void 0 : callbackFns.onshown) {
            callbackFns.onshown(tabContentEle);
        }
    };
    for (const listItemEle of listItemEles) {
        (isPanelOrMenuListTabs
            ? listItemEle
            : listItemEle.getElementsByTagName("a")[0]).addEventListener("click", tabClickFn);
    }
};
