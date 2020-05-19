import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/types";
declare const cityssm: cityssmGlobal;

import type { llmGlobal } from "./types";
declare const llm: llmGlobal;


(function() {

  const formEle = <HTMLFormElement>document.getElementById("form--financialSummary");

  const tableEle = <HTMLTableElement>document.getElementById("table--financialSummary");
  const tbodyEle = tableEle.getElementsByTagName("tbody")[0];
  const tfootEle = tableEle.getElementsByTagName("tfoot")[0];

  function formatDollarsAsHTML(dollarAmt: number) {

    if (dollarAmt < 0) {
      return "<span class=\"has-text-danger\">($" + (dollarAmt * -1).toFixed(2) + ")</span>";
    }

    return "$" + dollarAmt.toFixed(2);

  }

  function getFinancialSummary() {

    tableEle.classList.remove("has-status-view");
    tableEle.classList.add("has-status-loading");

    cityssm.postJSON("/events/doGetFinancialSummary", formEle, function(summary) {

      // Hide all rows

      const trEles = tbodyEle.children;

      for (let trIndex = 0; trIndex < trEles.length; trIndex += 1) {

        trEles[trIndex].classList.add("is-hidden");

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

      for (let summaryIndex = 0; summaryIndex < summary.length; summaryIndex += 1) {

        const licenceTypeSummaryObj = summary[summaryIndex];

        const trEle = <HTMLTableRowElement>tbodyEle.querySelector("tr[data-licence-type-key='" + licenceTypeSummaryObj.licenceTypeKey + "']");

        (<HTMLSpanElement>trEle.querySelector("[data-field='licenceCount']")).innerText =
          licenceTypeSummaryObj.licenceCount;
        licenceCount += licenceTypeSummaryObj.licenceCount;

        trEle.querySelector("[data-field='eventCount']").innerHTML =
          (licenceTypeSummaryObj.reportDateCount === licenceTypeSummaryObj.eventCount ? "" : "<span class=\"has-text-danger\" data-tooltip=\"Events Unreported\">") +
          licenceTypeSummaryObj.reportDateCount + "/" + licenceTypeSummaryObj.eventCount +
          (licenceTypeSummaryObj.reportDateCount === licenceTypeSummaryObj.eventCount ? "" : "</span>");

        reportDateCount += licenceTypeSummaryObj.reportDateCount;
        eventCount += licenceTypeSummaryObj.eventCount;

        (<HTMLSpanElement>trEle.querySelector("[data-field='costs_receiptsSum']")).innerText =
          "$" + licenceTypeSummaryObj.costs_receiptsSum.toFixed(2);
        costs_receiptsSum += licenceTypeSummaryObj.costs_receiptsSum;

        (<HTMLSpanElement>trEle.querySelector("[data-field='costs_adminSum']")).innerText =
          "$" + licenceTypeSummaryObj.costs_adminSum.toFixed(2);
        costs_adminSum += licenceTypeSummaryObj.costs_adminSum;

        (<HTMLSpanElement>trEle.querySelector("[data-field='costs_prizesAwardedSum']")).innerText =
          "$" + licenceTypeSummaryObj.costs_prizesAwardedSum.toFixed(2);
        costs_prizesAwardedSum += licenceTypeSummaryObj.costs_prizesAwardedSum;

        trEle.querySelector("[data-field='costs_netProceedsSum']").innerHTML =
          formatDollarsAsHTML(licenceTypeSummaryObj.costs_netProceedsSum);
        costs_netProceedsSum += licenceTypeSummaryObj.costs_netProceedsSum;

        (<HTMLSpanElement>trEle.querySelector("[data-field='costs_amountDonatedSum']")).innerText =
          "$" + licenceTypeSummaryObj.costs_amountDonatedSum.toFixed(2);
        costs_amountDonatedSum += licenceTypeSummaryObj.costs_amountDonatedSum;

        (<HTMLSpanElement>trEle.querySelector("[data-field='licenceFeeSum']")).innerText =
          "$" + licenceTypeSummaryObj.licenceFeeSum.toFixed(2);

        licenceFeeSum += licenceTypeSummaryObj.licenceFeeSum;

        trEle.classList.remove("is-hidden");

      }

      (<HTMLSpanElement>tfootEle.querySelector("[data-field='licenceCount']")).innerText = licenceCount.toString();

      tfootEle.querySelector("[data-field='eventCount']").innerHTML =
        (reportDateCount === eventCount ? "" : "<span class=\"has-text-danger\" data-tooltip=\"Events Unreported\">") +
        reportDateCount + "/" + eventCount +
        (reportDateCount === eventCount ? "" : "</span>");

      (<HTMLSpanElement>tfootEle.querySelector("[data-field='costs_receiptsSum']")).innerText =
        "$" + costs_receiptsSum.toFixed(2);

      (<HTMLSpanElement>tfootEle.querySelector("[data-field='costs_adminSum']")).innerText =
        "$" + costs_adminSum.toFixed(2);

      (<HTMLSpanElement>tfootEle.querySelector("[data-field='costs_prizesAwardedSum']")).innerText =
        "$" + costs_prizesAwardedSum.toFixed(2);

      tfootEle.querySelector("[data-field='costs_netProceedsSum']").innerHTML =
        formatDollarsAsHTML(costs_netProceedsSum);

      (<HTMLSpanElement>tfootEle.querySelector("[data-field='costs_amountDonatedSum']")).innerText =
        "$" + costs_amountDonatedSum.toFixed(2);

      (<HTMLSpanElement>tfootEle.querySelector("[data-field='licenceFeeSum']")).innerText =
        "$" + licenceFeeSum.toFixed(2);

      tableEle.classList.remove("has-status-loading");
      tableEle.classList.add("has-status-view");

    });

  }

  llm.initializeDateRangeSelector(
    document.querySelector(".is-date-range-selector[data-field-key='eventDate']"),
    getFinancialSummary
  );

  getFinancialSummary();

}());
