import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


(() => {

  const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");

  const formEle = document.getElementById("form--financialSummary") as HTMLFormElement;

  const tableEle = document.getElementById("table--financialSummary") as HTMLTableElement;
  const tbodyEle = tableEle.getElementsByTagName("tbody")[0];
  const tfootEle = tableEle.getElementsByTagName("tfoot")[0];

  const formatDollarsAsHTMLFn = (dollarAmt: number) => {

    if (dollarAmt < 0) {
      return "<span class=\"has-text-danger\">($" + (dollarAmt * -1).toFixed(2) + ")</span>";
    }

    return "$" + dollarAmt.toFixed(2);
  };

  const getFinancialSummaryFn = () => {

    tableEle.classList.remove("has-status-view");
    tableEle.classList.add("has-status-loading");

    cityssm.postJSON(urlPrefix + "/events/doGetFinancialSummary", formEle, (summary: Array<{
      licenceTypeKey: string;
      licenceCount: number;
      eventCount: number;
      reportDateCount: number;
      licenceFeeSum: number;
      costs_receiptsSum: number;
      costs_adminSum: number;
      costs_netProceedsSum: number;
      costs_prizesAwardedSum: number;
      costs_amountDonatedSum: number;
    }>) => {

      // Hide all rows

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

        const trEle: HTMLTableRowElement =
          tbodyEle.querySelector("tr[data-licence-type-key='" + licenceTypeSummaryObj.licenceTypeKey + "']");

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (trEle.querySelector("[data-field='licenceCount']") as HTMLSpanElement).innerText =
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

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (trEle.querySelector("[data-field='costs_receiptsSum']") as HTMLSpanElement).innerText =
          "$" + licenceTypeSummaryObj.costs_receiptsSum.toFixed(2);
        costs_receiptsSum += licenceTypeSummaryObj.costs_receiptsSum;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (trEle.querySelector("[data-field='costs_adminSum']") as HTMLSpanElement).innerText =
          "$" + licenceTypeSummaryObj.costs_adminSum.toFixed(2);
        costs_adminSum += licenceTypeSummaryObj.costs_adminSum;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (trEle.querySelector("[data-field='costs_prizesAwardedSum']") as HTMLSpanElement).innerText =
          "$" + licenceTypeSummaryObj.costs_prizesAwardedSum.toFixed(2);
        costs_prizesAwardedSum += licenceTypeSummaryObj.costs_prizesAwardedSum;

        trEle.querySelector("[data-field='costs_netProceedsSum']").innerHTML =
          formatDollarsAsHTMLFn(licenceTypeSummaryObj.costs_netProceedsSum);
        costs_netProceedsSum += licenceTypeSummaryObj.costs_netProceedsSum;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (trEle.querySelector("[data-field='costs_amountDonatedSum']") as HTMLSpanElement).innerText =
          "$" + licenceTypeSummaryObj.costs_amountDonatedSum.toFixed(2);
        costs_amountDonatedSum += licenceTypeSummaryObj.costs_amountDonatedSum;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (trEle.querySelector("[data-field='licenceFeeSum']") as HTMLSpanElement).innerText =
          "$" + licenceTypeSummaryObj.licenceFeeSum.toFixed(2);

        licenceFeeSum += licenceTypeSummaryObj.licenceFeeSum;

        trEle.classList.remove("is-hidden");

      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (tfootEle.querySelector("[data-field='licenceCount']") as HTMLSpanElement).innerText = licenceCount.toString();

      tfootEle.querySelector("[data-field='eventCount']").innerHTML =
        (reportDateCount === eventCount
          ? ""
          : "<span class=\"has-text-danger\" data-tooltip=\"Events Unreported\">") +
        reportDateCount.toString() + "/" + eventCount.toString() +
        (reportDateCount === eventCount
          ? ""
          : "</span>");

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (tfootEle.querySelector("[data-field='costs_receiptsSum']") as HTMLSpanElement).innerText =
        "$" + costs_receiptsSum.toFixed(2);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (tfootEle.querySelector("[data-field='costs_adminSum']") as HTMLSpanElement).innerText =
        "$" + costs_adminSum.toFixed(2);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (tfootEle.querySelector("[data-field='costs_prizesAwardedSum']") as HTMLSpanElement).innerText =
        "$" + costs_prizesAwardedSum.toFixed(2);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      tfootEle.querySelector("[data-field='costs_netProceedsSum']").innerHTML =
        formatDollarsAsHTMLFn(costs_netProceedsSum);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (tfootEle.querySelector("[data-field='costs_amountDonatedSum']") as HTMLSpanElement).innerText =
        "$" + costs_amountDonatedSum.toFixed(2);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (tfootEle.querySelector("[data-field='licenceFeeSum']") as HTMLSpanElement).innerText =
        "$" + licenceFeeSum.toFixed(2);

      tableEle.classList.remove("has-status-loading");
      tableEle.classList.add("has-status-view");

    });

  };

  llm.initializeDateRangeSelector(
    document.querySelector(".is-date-range-selector[data-field-key='eventDate']"),
    getFinancialSummaryFn
  );

  getFinancialSummaryFn();

})();
