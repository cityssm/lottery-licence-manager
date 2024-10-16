"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b;
    const urlPrefix = (_b = (_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.urlPrefix) !== null && _b !== void 0 ? _b : '';
    const safeUrlPrefix = cityssm.escapeHTML(urlPrefix);
    const currentDateString = cityssm.dateToString(new Date());
    const eventDateFilterElement = document.querySelector('#filter--eventDate');
    const showLicencesCheckboxElement = document.querySelector('#filter--showLicences');
    const eventContainerElement = document.querySelector('#container--events');
    const dayNames = exports.config_days;
    const licenceTypes = exports.config_licenceTypes;
    function refreshEventsFunction() {
        cityssm.clearElement(eventContainerElement);
        if (eventDateFilterElement.value === '') {
            eventDateFilterElement.value = cityssm.dateToString(new Date());
        }
        cityssm.postJSON(`${urlPrefix}/events/doGetEventsByWeek`, {
            eventDate: eventDateFilterElement.value
        }, (rawResponseJSON) => {
            var _a, _b;
            const responseJSON = rawResponseJSON;
            if (responseJSON.licences.length === 0 &&
                responseJSON.events.length === 0) {
                eventContainerElement.innerHTML = `<div class="message is-info">
            <p class="message-body">
            There are no licences or events with activity between
            ${cityssm.escapeHTML(responseJSON.startDateString)} and ${cityssm.escapeHTML(responseJSON.endDateString)}.
            </p>
            </div>`;
                return;
            }
            const tableElement = document.createElement('table');
            tableElement.className =
                'table is-fixed is-fullwidth is-bordered has-sticky-header';
            let headerTheadHTML = '<thead><tr>';
            const headerDate = cityssm.dateStringToDate(responseJSON.startDateString);
            for (let weekDayIndex = 0; weekDayIndex <= 6; weekDayIndex += 1) {
                const headerDateString = cityssm.dateToString(headerDate);
                headerTheadHTML += `<th class="has-text-centered
            ${headerDateString === currentDateString
                    ? ' has-background-primary has-text-white'
                    : ' has-background-white-ter'}">
              ${dayNames[weekDayIndex]}<br />
              ${headerDateString}
            </th>`;
                headerDate.setDate(headerDate.getDate() + 1);
            }
            headerTheadHTML += '</tr></thead>';
            tableElement.innerHTML = headerTheadHTML;
            const licenceTbodyElement = document.createElement('tbody');
            licenceTbodyElement.id = 'tbody--licences';
            if (!showLicencesCheckboxElement.checked) {
                licenceTbodyElement.className = 'is-hidden';
            }
            for (const licenceRecord of responseJSON.licences) {
                let fillerSize = 0;
                let leftSideFiller = '';
                if (licenceRecord.startDateString > responseJSON.startDateString) {
                    fillerSize = cityssm.dateStringDifferenceInDays(responseJSON.startDateString, licenceRecord.startDateString);
                    for (let fillerIndex = 0; fillerIndex < fillerSize; fillerIndex += 1) {
                        leftSideFiller += '<td></td>';
                    }
                }
                let licenceColspan = 1;
                if (licenceRecord.startDateString !== licenceRecord.endDateString) {
                    licenceColspan = Math.min(7 - fillerSize, cityssm.dateStringDifferenceInDays(fillerSize === 0
                        ? responseJSON.startDateString
                        : licenceRecord.startDateString, licenceRecord.endDateString) + 1);
                }
                let rightSideFiller = '';
                for (let fillerIndex = fillerSize + licenceColspan; fillerIndex < 7; fillerIndex += 1) {
                    rightSideFiller += '<td></td>';
                }
                const licenceType = licenceTypes[licenceRecord.licenceTypeKey];
                licenceTbodyElement.insertAdjacentHTML('beforeend', `<tr>
              ${leftSideFiller}
              <td colspan="${licenceColspan.toString()}">
                <a class="button has-text-left is-small is-block has-height-auto is-wrap is-primary is-light"
                  data-tooltip="View Licence" href="${safeUrlPrefix}/licences/${licenceRecord.licenceID.toString()}">
                  <div class="columns mb-0 is-variable is-1">
                    <div class="column pb-2 is-narrow">
                      <i class="fas fa-fw fa-certificate" aria-hidden="true"></i>
                    </div>
                    <div class="column pb-2 has-text-weight-semibold">
                      ${cityssm.escapeHTML(licenceRecord.externalLicenceNumber)}<br />
                      ${cityssm.escapeHTML(licenceType !== null && licenceType !== void 0 ? licenceType : licenceRecord.licenceTypeKey)}
                    </div>
                  </div>
                  <div class="columns mb-0 is-variable is-1">
                    <div class="column pb-2 is-narrow">
                      <i class="fas fa-fw fa-map-marker-alt" aria-hidden="true"></i>
                    </div>
                    <div class="column pb-2">
                      ${cityssm.escapeHTML(licenceRecord.locationName === ''
                    ? licenceRecord.locationAddress1
                    : licenceRecord.locationName)}
                    </div>
                  </div>
                  <div class="columns mb-0 is-variable is-1">
                    <div class="column pb-2 is-narrow">
                      <i class="fas fa-fw fa-users" aria-hidden="true"></i>
                    </div>
                    <div class="column pb-2">
                      ${cityssm.escapeHTML((_a = licenceRecord.organizationName) !== null && _a !== void 0 ? _a : '')}
                    </div>
                  </div>
                  <div class="columns is-variable is-1">
                    <div class="column is-narrow">
                      <i class="fas fa-fw fa-calendar" aria-hidden="true"></i>
                    </div>
                    <div class="column">
                      ${cityssm.escapeHTML(licenceRecord.startDateString)}
                      ${cityssm.escapeHTML(licenceRecord.startDateString ===
                    licenceRecord.endDateString
                    ? ''
                    : ` to ${licenceRecord.endDateString}`)}
                    </div>
                  </div>
                </a>
              </td>
              ${rightSideFiller}
            </tr>`);
            }
            tableElement.append(licenceTbodyElement);
            const eventTdElements = [
                document.createElement('td'),
                document.createElement('td'),
                document.createElement('td'),
                document.createElement('td'),
                document.createElement('td'),
                document.createElement('td'),
                document.createElement('td')
            ];
            for (const eventRecord of responseJSON.events) {
                const licenceType = licenceTypes[eventRecord.licenceTypeKey];
                const tdIndex = cityssm
                    .dateStringToDate(eventRecord.eventDateString)
                    .getDay();
                eventTdElements[tdIndex].insertAdjacentHTML('beforeend', `<a class="button mb-2 has-text-left is-small is-block has-height-auto is-wrap is-link is-light"
              data-tooltip="View Event"
              href="${safeUrlPrefix}/events/${eventRecord.licenceID.toString()}/${eventRecord.eventDate.toString()}">
              <div class="columns mb-0 is-variable is-1">
                <div class="column pb-2 is-narrow">
                  <i class="fas fa-fw fa-clock" aria-hidden="true"></i>
                </div>
                <div class="column pb-2">
                  ${cityssm.escapeHTML(eventRecord.startTimeString)}
                </div>
              </div>
              <div class="columns mb-0 is-variable is-1">
                <div class="column pb-2 is-narrow">
                  <i class="fas fa-fw fa-certificate" aria-hidden="true"></i>
                </div>
                <div class="column pb-2 has-text-weight-semibold">
                  ${cityssm.escapeHTML(eventRecord.externalLicenceNumber)}<br />
                  ${cityssm.escapeHTML(licenceType !== null && licenceType !== void 0 ? licenceType : eventRecord.licenceTypeKey)}
                </div>
              </div>
              <div class="columns mb-0 is-variable is-1">
                <div class="column pb-2 is-narrow">
                  <i class="fas fa-fw fa-map-marker-alt" aria-hidden="true"></i>
                </div>
                <div class="column pb-2">
                  ${cityssm.escapeHTML(eventRecord.locationName === ''
                    ? eventRecord.locationAddress1
                    : eventRecord.locationName)}
                </div>
              </div>
              <div class="columns mb-0 is-variable is-1">
                <div class="column pb-2 is-narrow">
                  <i class="fas fa-fw fa-users" aria-hidden="true"></i>
                </div>
                <div class="column pb-2">
                  ${cityssm.escapeHTML((_b = eventRecord.organizationName) !== null && _b !== void 0 ? _b : '')}
                </div>
              </div>
            </a>`);
            }
            const eventTrElement = document.createElement('tr');
            for (const eventTdElement of eventTdElements) {
                eventTrElement.append(eventTdElement);
            }
            const eventTbodyElement = document.createElement('tbody');
            eventTbodyElement.append(eventTrElement);
            tableElement.append(eventTbodyElement);
            eventContainerElement.append(tableElement);
        });
    }
    eventDateFilterElement.addEventListener('change', refreshEventsFunction);
    refreshEventsFunction();
    showLicencesCheckboxElement.addEventListener('change', () => {
        var _a, _b;
        if (showLicencesCheckboxElement.checked) {
            (_a = document.querySelector('#tbody--licences')) === null || _a === void 0 ? void 0 : _a.classList.remove('is-hidden');
        }
        else {
            (_b = document.querySelector('#tbody--licences')) === null || _b === void 0 ? void 0 : _b.classList.add('is-hidden');
        }
    });
})();
