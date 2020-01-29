"use strict";

(function() {

  const formEle = document.getElementById("form--financialSummary");

  const tableEle = document.getElementById("table--financialSummary");
  const tbodyEle = tableEle.getElementsByTagName("tbody")[0];
  const tfootEle = tableEle.getElementsByTagName("tfoot")[0];

  function getFinancialSummary() {

    tableEle.classList.remove("has-status-view");
    tableEle.classList.add("has-status-loading");

    llm.postJSON("/events/doGetFinancialSummary", formEle, function(summary) {

      // Hide all rows

      const trEles = tbodyEle.children;

      for (let trIndex = 0; trIndex < trEles.length; trIndex += 1) {

        trEles[trIndex].classList.add("is-hidden");

      }

      let licenceCount = 0;
      let costs_receiptsSum = 0.0;
      let costs_adminSum = 0.0;
      let costs_prizesAwardedSum = 0.0;
      let costs_charitableDonationsSum = 0.0;
      let costs_netProceedsSum = 0.0;
      let costs_amountDonatedSum = 0.0;
      let licenceFeeSum = 0.0;

      for (let summaryIndex = 0; summaryIndex < summary.length; summaryIndex += 1) {

        const licenceTypeSummaryObj = summary[summaryIndex];

        const trEle = tbodyEle.querySelector("tr[data-licence-type-key='" + licenceTypeSummaryObj.licenceTypeKey + "']");

        trEle.querySelector("[data-field='licenceCount']").innerText = licenceTypeSummaryObj.licenceCount;
        licenceCount += licenceTypeSummaryObj.licenceCount;

        trEle.querySelector("[data-field='costs_receiptsSum']").innerText =
          "$ " + licenceTypeSummaryObj.costs_receiptsSum.toFixed(2);
        costs_receiptsSum += licenceTypeSummaryObj.costs_receiptsSum;

        trEle.querySelector("[data-field='costs_adminSum']").innerText =
          "$ " + licenceTypeSummaryObj.costs_adminSum.toFixed(2);
        costs_adminSum += licenceTypeSummaryObj.costs_adminSum;

        trEle.querySelector("[data-field='costs_prizesAwardedSum']").innerText =
          "$ " + licenceTypeSummaryObj.costs_prizesAwardedSum.toFixed(2);
        costs_prizesAwardedSum += licenceTypeSummaryObj.costs_prizesAwardedSum;

        trEle.querySelector("[data-field='costs_charitableDonationsSum']").innerText =
          "$ " + licenceTypeSummaryObj.costs_charitableDonationsSum.toFixed(2);
        costs_charitableDonationsSum += licenceTypeSummaryObj.costs_charitableDonationsSum;

        trEle.querySelector("[data-field='costs_netProceedsSum']").innerText =
          "$ " + licenceTypeSummaryObj.costs_netProceedsSum.toFixed(2);
        costs_netProceedsSum += licenceTypeSummaryObj.costs_netProceedsSum;

        trEle.querySelector("[data-field='costs_amountDonatedSum']").innerText =
          "$ " + licenceTypeSummaryObj.costs_amountDonatedSum.toFixed(2);
        costs_amountDonatedSum += licenceTypeSummaryObj.costs_amountDonatedSum;

        trEle.querySelector("[data-field='licenceFeeSum']").innerText =
          "$ " + licenceTypeSummaryObj.licenceFeeSum.toFixed(2);
        licenceFeeSum += licenceTypeSummaryObj.licenceFeeSum;

        trEle.classList.remove("is-hidden");

      }

      tfootEle.querySelector("[data-field='licenceCount']").innerText = licenceCount;

      tfootEle.querySelector("[data-field='costs_receiptsSum']").innerText =
        "$ " + costs_receiptsSum.toFixed(2);

      tfootEle.querySelector("[data-field='costs_adminSum']").innerText =
        "$ " + costs_adminSum.toFixed(2);

      tfootEle.querySelector("[data-field='costs_prizesAwardedSum']").innerText =
        "$ " + costs_prizesAwardedSum.toFixed(2);

      tfootEle.querySelector("[data-field='costs_charitableDonationsSum']").innerText =
        "$ " + costs_charitableDonationsSum.toFixed(2);

      tfootEle.querySelector("[data-field='costs_netProceedsSum']").innerText =
        "$ " + costs_netProceedsSum.toFixed(2);

      tfootEle.querySelector("[data-field='costs_amountDonatedSum']").innerText =
        "$ " + costs_amountDonatedSum.toFixed(2);

      tfootEle.querySelector("[data-field='licenceFeeSum']").innerText = "$ " + licenceFeeSum.toFixed(2);

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
