"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const urlPrefix = document.querySelector("main").getAttribute("data-url-prefix");
    const formElement = document.querySelector("#form--licenceTypes");
    const containerElement = document.querySelector("#container--licenceTypes");
    let externalLicenceNumberLabel = "";
    const getLicenceTypeSummaryFunction = () => {
        cityssm.clearElement(containerElement);
        containerElement.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
            "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
            "<em>Loading report...</em>" +
            "</p>";
        cityssm.postJSON(urlPrefix + "/licences/doGetLicenceTypeSummary", formElement, (licenceList) => {
            cityssm.clearElement(containerElement);
            if (licenceList.length === 0) {
                containerElement.innerHTML = "<div class=\"message is-info\">" +
                    "<p class=\"message-body\">There are no licences available that meet your search criteria.</p>" +
                    "</div>";
                return;
            }
            const tableElement = document.createElement("table");
            tableElement.className = "table is-fullwidth is-striped is-hoverable has-sticky-header";
            tableElement.innerHTML = "<thead><tr>" +
                "<th>Application Date</th>" +
                "<th>Issue Date</th>" +
                "<th>" + externalLicenceNumberLabel + "</th>" +
                "<th>Organization</th>" +
                "<th>Location</th>" +
                "<th class=\"has-text-right\">Prize Value</th>" +
                "<th class=\"has-text-right\">Licence Fee</th>" +
                "</tr></thead>";
            const tbodyElement = document.createElement("tbody");
            let issueDateCount = 0;
            let totalPrizeValueSum = 0;
            let licenceFeeSum = 0;
            for (const licenceObject of licenceList) {
                const trElement = document.createElement("tr");
                trElement.insertAdjacentHTML("beforeend", "<td>" + licenceObject.applicationDateString + "</td>");
                trElement.insertAdjacentHTML("beforeend", "<td>" + licenceObject.issueDateString + "</td>");
                trElement.insertAdjacentHTML("beforeend", "<td>" +
                    "<a data-tooltip=\"View Licence\" href=\"" + cityssm.escapeHTML(urlPrefix) + "/licences/" + licenceObject.licenceID.toString() + "\">" +
                    cityssm.escapeHTML(licenceObject.externalLicenceNumber) + "<br />" +
                    "<small>Licence #" + licenceObject.licenceID.toString() + "</small>" +
                    "</a>" +
                    "</td>");
                trElement.insertAdjacentHTML("beforeend", "<td>" + cityssm.escapeHTML(licenceObject.organizationName) + "</td>");
                trElement.insertAdjacentHTML("beforeend", "<td>" +
                    (licenceObject.locationDisplayName
                        ? cityssm.escapeHTML(licenceObject.locationDisplayName)
                        : "<span class=\"has-text-grey\">(No Location)</span>") +
                    "</td>");
                trElement.insertAdjacentHTML("beforeend", "<td class=\"is-nowrap has-text-right\">$ " + licenceObject.totalPrizeValue.toFixed(2) + "</td>");
                trElement.insertAdjacentHTML("beforeend", "<td class=\"is-nowrap has-text-right\">$ " + licenceObject.licenceFee.toFixed(2) + "</td>");
                tbodyElement.append(trElement);
                if (licenceObject.issueDate && licenceObject.issueDate > 0) {
                    issueDateCount += 1;
                }
                totalPrizeValueSum += licenceObject.totalPrizeValue;
                licenceFeeSum += licenceObject.licenceFee;
            }
            tableElement.append(tbodyElement);
            const tfootElement = document.createElement("tfoot");
            tfootElement.innerHTML = "<tr>" +
                "<th>" +
                licenceList.length.toString() + " licence" + (licenceList.length === 1 ? "" : "s") +
                "</th>" +
                "<th>" +
                issueDateCount.toString() + " issued" +
                "</th>" +
                "<td></td>" +
                "<td></td>" +
                "<td></td>" +
                "<th class=\"is-nowrap has-text-right\">$ " + totalPrizeValueSum.toFixed(2) + "</th>" +
                "<th class=\"is-nowrap has-text-right\">$ " + licenceFeeSum.toFixed(2) + "</th>" +
                "</tr>";
            tableElement.append(tfootElement);
            containerElement.append(tableElement);
        });
    };
    llm.initializeDateRangeSelector(document.querySelector(".is-date-range-selector[data-field-key='applicationDate']"), getLicenceTypeSummaryFunction);
    document.querySelector("#filter--licenceTypeKey").addEventListener("change", getLicenceTypeSummaryFunction);
    llm.getDefaultConfigProperty("externalLicenceNumber_fieldLabel", (fieldLabel) => {
        externalLicenceNumberLabel = fieldLabel;
        getLicenceTypeSummaryFunction();
    });
})();
