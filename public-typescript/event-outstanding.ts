/* eslint-disable unicorn/filename-case, unicorn/prefer-module, @eslint-community/eslint-comments/disable-enable-pair */

import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types'
import type { DateDiff } from '@cityssm/date-diff/types'

import type { LotteryEvent } from '../types/recordTypes'

declare const cityssm: cityssmGlobal
declare const exports: {
  dateDiff: DateDiff
}
;(() => {
  const dateDiff = exports.dateDiff

  const urlPrefix = document.querySelector('main')?.dataset.urlPrefix

  const formElement = document.querySelector(
    '#form--outstandingEvents'
  ) as HTMLFormElement
  const tbodyElement = document.querySelector(
    '#tbody--outstandingEvents'
  ) as HTMLElement

  function getOutstandingEventsFunction(): void {
    cityssm.clearElement(tbodyElement)

    cityssm.postJSON(
      `${urlPrefix}/events/doGetOutstandingEvents`,
      formElement,
      (rawResponseJSON) => {
        const outstandingEvents = rawResponseJSON as unknown as LotteryEvent[]

        const nowDate = new Date()

        let currentOrganizationID = -1

        for (const outstandingEventObject of outstandingEvents) {
          if (currentOrganizationID !== outstandingEventObject.organizationID) {
            currentOrganizationID = outstandingEventObject.organizationID

            tbodyElement.insertAdjacentHTML(
              'beforeend',
              `<tr>
                <th class="has-background-grey-lighter" colspan="9">
                  <h2 class="title is-4">
                    ${cityssm.escapeHTML(outstandingEventObject.organizationName ?? '')}
                  </h2>
                </th>
                </tr>`
            )
          }

          const trElement = document.createElement('tr')

          const licenceURL = `${urlPrefix}/licences/${outstandingEventObject.licenceID.toString()}`

          trElement.insertAdjacentHTML(
            'beforeend',
            `<td>
              <a href="${cityssm.escapeHTML(licenceURL)}" data-tooltip="View Licence" target="_blank">
                ${cityssm.escapeHTML(outstandingEventObject.externalLicenceNumber)}<br / >
                <small>
                  Licence #${cityssm.escapeHTML(outstandingEventObject.licenceID.toString())}
                </small>
              </a>
              </td>`
          )

          trElement.insertAdjacentHTML(
            'beforeend',
            `<td>${cityssm.escapeHTML(outstandingEventObject.licenceType)}</td>`
          )

          const eventURL = `${urlPrefix}/events/${outstandingEventObject.licenceID.toString()}/${outstandingEventObject.eventDate.toString()}`

          const eventDate = cityssm.dateStringToDate(
            outstandingEventObject.eventDateString
          )

          // eslint-disable-next-line no-unsanitized/method
          trElement.insertAdjacentHTML(
            'beforeend',
            `<td>
              <a href="${cityssm.escapeHTML(eventURL)}" data-tooltip="View Event" target="_blank">
                ${cityssm.escapeHTML(outstandingEventObject.eventDateString)}
              </a>
              ${
                eventDate < nowDate
                  ? `<br />
                      <span class="is-size-7">
                        ${cityssm.escapeHTML(dateDiff(eventDate, nowDate).formatted)}
                        ago
                      </span>`
                  : ''
              }</td>`
          )

          // eslint-disable-next-line no-unsanitized/method
          trElement.insertAdjacentHTML(
            'beforeend',
            `<td class="has-text-centered">
              ${
                outstandingEventObject.reportDate === null ||
                outstandingEventObject.reportDate === 0
                  ? `<span class="icon" data-tooltip="Report Date Not Recorded">
                      <i class="fas fa-times has-text-danger" aria-hidden="true"></i>
                      </span>
                      <span class="sr-only">Report Date Not Recorded</span>`
                  : cityssm.escapeHTML(outstandingEventObject.reportDateString)
              }
              </td>`
          )

          // eslint-disable-next-line no-unsanitized/method
          trElement.insertAdjacentHTML(
            'beforeend',
            `<td class="has-text-centered">
              ${
                outstandingEventObject.bank_name_isOutstanding
                  ? `<span class="icon" data-tooltip="Banking Information Outstanding">
                      <i class="fas fa-times has-text-danger" aria-hidden="true"></i>
                      </span>
                      <span class="sr-only">Banking Information Outstanding</span>`
                  : `<span class="icon" data-tooltip="Banking Information Recorded">
                      <i class="fas fa-check has-text-success" aria-hidden="true"></i>
                      </span>
                      <span class="sr-only">Banking Information Recorded</span>`
              }
              </td>`
          )

          // eslint-disable-next-line no-unsanitized/method
          trElement.insertAdjacentHTML(
            'beforeend',
            `<td class="has-text-centered">
              ${
                outstandingEventObject.costs_receiptsSum === null ||
                outstandingEventObject.costs_receiptsSum === 0
                  ? `<span class="icon" data-tooltip="Receipts Amount Outstanding">
                      <i class="fas fa-times has-text-danger" aria-hidden="true"></i>
                      </span>
                      <span class="sr-only">Receipts Amount Outstanding</span>`
                  : `<span class="icon" data-tooltip="Receipts Amount Recorded">
                      <i class="fas fa-check has-text-success" aria-hidden="true"></i>
                      </span>
                      <span class="sr-only">Receipts Amount Recorded</span>`
              }
              </td>`
          )

          tbodyElement.append(trElement)
        }
      }
    )
  }

  document
    .querySelector('#filter--licenceTypeKey')
    ?.addEventListener('change', getOutstandingEventsFunction)
  document
    .querySelector('#filter--eventDateType')
    ?.addEventListener('change', getOutstandingEventsFunction)

  getOutstandingEventsFunction()
})()
