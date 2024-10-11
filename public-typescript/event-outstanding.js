"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b, _c;
    const dateDiff = exports.dateDiff;
    const urlPrefix = (_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.urlPrefix;
    const formElement = document.querySelector('#form--outstandingEvents');
    const tbodyElement = document.querySelector('#tbody--outstandingEvents');
    function getOutstandingEventsFunction() {
        cityssm.clearElement(tbodyElement);
        cityssm.postJSON(`${urlPrefix}/events/doGetOutstandingEvents`, formElement, (rawResponseJSON) => {
            var _a;
            const outstandingEvents = rawResponseJSON;
            const nowDate = new Date();
            let currentOrganizationID = -1;
            for (const outstandingEventObject of outstandingEvents) {
                if (currentOrganizationID !== outstandingEventObject.organizationID) {
                    currentOrganizationID = outstandingEventObject.organizationID;
                    tbodyElement.insertAdjacentHTML('beforeend', `<tr>
                <th class="has-background-grey-lighter" colspan="9">
                  <h2 class="title is-4">
                    ${cityssm.escapeHTML((_a = outstandingEventObject.organizationName) !== null && _a !== void 0 ? _a : '')}
                  </h2>
                </th>
                </tr>`);
                }
                const trElement = document.createElement('tr');
                const licenceURL = `${urlPrefix}/licences/${outstandingEventObject.licenceID.toString()}`;
                trElement.insertAdjacentHTML('beforeend', `<td>
              <a href="${cityssm.escapeHTML(licenceURL)}" data-tooltip="View Licence" target="_blank">
                ${cityssm.escapeHTML(outstandingEventObject.externalLicenceNumber)}<br / >
                <small>
                  Licence #${cityssm.escapeHTML(outstandingEventObject.licenceID.toString())}
                </small>
              </a>
              </td>`);
                trElement.insertAdjacentHTML('beforeend', `<td>${cityssm.escapeHTML(outstandingEventObject.licenceType)}</td>`);
                const eventURL = `${urlPrefix}/events/${outstandingEventObject.licenceID.toString()}/${outstandingEventObject.eventDate.toString()}`;
                const eventDate = cityssm.dateStringToDate(outstandingEventObject.eventDateString);
                trElement.insertAdjacentHTML('beforeend', `<td>
              <a href="${cityssm.escapeHTML(eventURL)}" data-tooltip="View Event" target="_blank">
                ${cityssm.escapeHTML(outstandingEventObject.eventDateString)}
              </a>
              ${eventDate < nowDate
                    ? `<br />
                      <span class="is-size-7">
                        ${cityssm.escapeHTML(dateDiff(eventDate, nowDate).formatted)}
                        ago
                      </span>`
                    : ''}</td>`);
                trElement.insertAdjacentHTML('beforeend', `<td class="has-text-centered">
              ${outstandingEventObject.reportDate === null ||
                    outstandingEventObject.reportDate === 0
                    ? `<span class="icon" data-tooltip="Report Date Not Recorded">
                      <i class="fas fa-times has-text-danger" aria-hidden="true"></i>
                      </span>
                      <span class="sr-only">Report Date Not Recorded</span>`
                    : cityssm.escapeHTML(outstandingEventObject.reportDateString)}
              </td>`);
                trElement.insertAdjacentHTML('beforeend', `<td class="has-text-centered">
              ${outstandingEventObject.bank_name_isOutstanding
                    ? `<span class="icon" data-tooltip="Banking Information Outstanding">
                      <i class="fas fa-times has-text-danger" aria-hidden="true"></i>
                      </span>
                      <span class="sr-only">Banking Information Outstanding</span>`
                    : `<span class="icon" data-tooltip="Banking Information Recorded">
                      <i class="fas fa-check has-text-success" aria-hidden="true"></i>
                      </span>
                      <span class="sr-only">Banking Information Recorded</span>`}
              </td>`);
                trElement.insertAdjacentHTML('beforeend', `<td class="has-text-centered">
              ${outstandingEventObject.costs_receiptsSum === null ||
                    outstandingEventObject.costs_receiptsSum === 0
                    ? `<span class="icon" data-tooltip="Receipts Amount Outstanding">
                      <i class="fas fa-times has-text-danger" aria-hidden="true"></i>
                      </span>
                      <span class="sr-only">Receipts Amount Outstanding</span>`
                    : `<span class="icon" data-tooltip="Receipts Amount Recorded">
                      <i class="fas fa-check has-text-success" aria-hidden="true"></i>
                      </span>
                      <span class="sr-only">Receipts Amount Recorded</span>`}
              </td>`);
                tbodyElement.append(trElement);
            }
        });
    }
    (_b = document
        .querySelector('#filter--licenceTypeKey')) === null || _b === void 0 ? void 0 : _b.addEventListener('change', getOutstandingEventsFunction);
    (_c = document
        .querySelector('#filter--eventDateType')) === null || _c === void 0 ? void 0 : _c.addEventListener('change', getOutstandingEventsFunction);
    getOutstandingEventsFunction();
})();
