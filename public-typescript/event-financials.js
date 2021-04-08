"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");
    const formEle = document.getElementById("form--financialSummary");
    const tableEle = document.getElementById("table--financialSummary");
    const tbodyEle = tableEle.getElementsByTagName("tbody")[0];
    const tfootEle = tableEle.getElementsByTagName("tfoot")[0];
    const formatDollarsAsHTMLFn = (dollarAmt) => {
        if (dollarAmt < 0) {
            return "<span class=\"has-text-danger\">($" + (dollarAmt * -1).toFixed(2) + ")</span>";
        }
        return "$" + dollarAmt.toFixed(2);
    };
    const getFinancialSummaryFn = () => {
        tableEle.classList.remove("has-status-view");
        tableEle.classList.add("has-status-loading");
        cityssm.postJSON(urlPrefix + "/events/doGetFinancialSummary", formEle, (summary) => {
            const trEles = tbodyEle.children;
            for (const trEle of trEles) {
                trEle.classList.add("is-hidden");
            }
            let licenceCount = 0;
            let eventCount = 0;
            let reportDateCount = 0;
            let costs_receiptsSum = 0.0;
            let costs_adminSum = 0.0;
            let costs_prizesAwardedSum = 0.0;
            let costs_netProceedsSum = 0.0;
            let costs_amountDonatedSum = 0.0;
            let licenceFeeSum = 0.0;
            for (const licenceTypeSummaryObj of summary) {
                const trEle = tbodyEle.querySelector("tr[data-licence-type-key='" + licenceTypeSummaryObj.licenceTypeKey + "']");
                trEle.querySelector("[data-field='licenceCount']").innerText =
                    licenceTypeSummaryObj.licenceCount.toString();
                licenceCount += licenceTypeSummaryObj.licenceCount;
                trEle.querySelector("[data-field='eventCount']").innerHTML =
                    (licenceTypeSummaryObj.reportDateCount === licenceTypeSummaryObj.eventCount
                        ? ""
                        : "<span class=\"has-text-danger\" data-tooltip=\"Events Unreported\">") +
                        licenceTypeSummaryObj.reportDateCount.toString() + "/" + licenceTypeSummaryObj.eventCount.toString() +
                        (licenceTypeSummaryObj.reportDateCount === licenceTypeSummaryObj.eventCount ? "" : "</span>");
                reportDateCount += licenceTypeSummaryObj.reportDateCount;
                eventCount += licenceTypeSummaryObj.eventCount;
                trEle.querySelector("[data-field='costs_receiptsSum']").innerText =
                    "$" + licenceTypeSummaryObj.costs_receiptsSum.toFixed(2);
                costs_receiptsSum += licenceTypeSummaryObj.costs_receiptsSum;
                trEle.querySelector("[data-field='costs_adminSum']").innerText =
                    "$" + licenceTypeSummaryObj.costs_adminSum.toFixed(2);
                costs_adminSum += licenceTypeSummaryObj.costs_adminSum;
                trEle.querySelector("[data-field='costs_prizesAwardedSum']").innerText =
                    "$" + licenceTypeSummaryObj.costs_prizesAwardedSum.toFixed(2);
                costs_prizesAwardedSum += licenceTypeSummaryObj.costs_prizesAwardedSum;
                trEle.querySelector("[data-field='costs_netProceedsSum']").innerHTML =
                    formatDollarsAsHTMLFn(licenceTypeSummaryObj.costs_netProceedsSum);
                costs_netProceedsSum += licenceTypeSummaryObj.costs_netProceedsSum;
                trEle.querySelector("[data-field='costs_amountDonatedSum']").innerText =
                    "$" + licenceTypeSummaryObj.costs_amountDonatedSum.toFixed(2);
                costs_amountDonatedSum += licenceTypeSummaryObj.costs_amountDonatedSum;
                trEle.querySelector("[data-field='licenceFeeSum']").innerText =
                    "$" + licenceTypeSummaryObj.licenceFeeSum.toFixed(2);
                licenceFeeSum += licenceTypeSummaryObj.licenceFeeSum;
                trEle.classList.remove("is-hidden");
            }
            tfootEle.querySelector("[data-field='licenceCount']").innerText = licenceCount.toString();
            tfootEle.querySelector("[data-field='eventCount']").innerHTML =
                (reportDateCount === eventCount
                    ? ""
                    : "<span class=\"has-text-danger\" data-tooltip=\"Events Unreported\">") +
                    reportDateCount.toString() + "/" + eventCount.toString() +
                    (reportDateCount === eventCount
                        ? ""
                        : "</span>");
            tfootEle.querySelector("[data-field='costs_receiptsSum']").innerText =
                "$" + costs_receiptsSum.toFixed(2);
            tfootEle.querySelector("[data-field='costs_adminSum']").innerText =
                "$" + costs_adminSum.toFixed(2);
            tfootEle.querySelector("[data-field='costs_prizesAwardedSum']").innerText =
                "$" + costs_prizesAwardedSum.toFixed(2);
            tfootEle.querySelector("[data-field='costs_netProceedsSum']").innerHTML =
                formatDollarsAsHTMLFn(costs_netProceedsSum);
            tfootEle.querySelector("[data-field='costs_amountDonatedSum']").innerText =
                "$" + costs_amountDonatedSum.toFixed(2);
            tfootEle.querySelector("[data-field='licenceFeeSum']").innerText =
                "$" + licenceFeeSum.toFixed(2);
            tableEle.classList.remove("has-status-loading");
            tableEle.classList.add("has-status-view");
        });
    };
    llm.initializeDateRangeSelector(document.querySelector(".is-date-range-selector[data-field-key='eventDate']"), getFinancialSummaryFn);
    getFinancialSummaryFn();
})();