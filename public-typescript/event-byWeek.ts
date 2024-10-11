/* eslint-disable unicorn/filename-case, unicorn/prefer-module, @eslint-community/eslint-comments/disable-enable-pair */

import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types'

import type { DoGetEventsByWeekResponse } from '../handlers/events-post/doGetEventsByWeek.js'

declare const cityssm: cityssmGlobal
declare const exports: {
  config_days: string[]
  config_licenceTypes: Record<string, string>
}
;(() => {
  const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? ''
  const safeUrlPrefix = cityssm.escapeHTML(urlPrefix)

  const currentDateString = cityssm.dateToString(new Date())

  const eventDateFilterElement = document.querySelector(
    '#filter--eventDate'
  ) as HTMLInputElement
  const showLicencesCheckboxElement = document.querySelector(
    '#filter--showLicences'
  ) as HTMLInputElement
  const eventContainerElement = document.querySelector(
    '#container--events'
  ) as HTMLElement

  const dayNames = exports.config_days
  const licenceTypes = exports.config_licenceTypes

  function refreshEventsFunction(): void {
    cityssm.clearElement(eventContainerElement)

    if (eventDateFilterElement.value === '') {
      eventDateFilterElement.value = cityssm.dateToString(new Date())
    }

    cityssm.postJSON(
      `${urlPrefix}/events/doGetEventsByWeek`,
      {
        eventDate: eventDateFilterElement.value
      },
      (rawResponseJSON) => {
        const responseJSON =
          rawResponseJSON as unknown as DoGetEventsByWeekResponse

        if (
          responseJSON.licences.length === 0 &&
          responseJSON.events.length === 0
        ) {
          eventContainerElement.innerHTML = `<div class="message is-info">
            <p class="message-body">
            There are no licences or events with activity between
            ${cityssm.escapeHTML(responseJSON.startDateString)} and ${cityssm.escapeHTML(responseJSON.endDateString)}.
            </p>
            </div>`

          return
        }

        const tableElement = document.createElement('table')
        tableElement.className =
          'table is-fixed is-fullwidth is-bordered has-sticky-header'

        // Construct header
        let headerTheadHTML = '<thead><tr>'

        const headerDate = cityssm.dateStringToDate(
          responseJSON.startDateString
        )

        for (let weekDayIndex = 0; weekDayIndex <= 6; weekDayIndex += 1) {
          const headerDateString = cityssm.dateToString(headerDate)

          headerTheadHTML += `<th class="has-text-centered
            ${
              headerDateString === currentDateString
                ? ' has-background-primary has-text-white'
                : ' has-background-white-ter'
            }">
              ${dayNames[weekDayIndex]}<br />
              ${headerDateString}
            </th>`

          headerDate.setDate(headerDate.getDate() + 1)
        }

        headerTheadHTML += '</tr></thead>'

        // eslint-disable-next-line no-unsanitized/property
        tableElement.innerHTML = headerTheadHTML

        // Construct licences tbody
        const licenceTbodyElement = document.createElement('tbody')
        licenceTbodyElement.id = 'tbody--licences'

        if (!showLicencesCheckboxElement.checked) {
          licenceTbodyElement.className = 'is-hidden'
        }

        for (const licenceRecord of responseJSON.licences) {
          let fillerSize = 0
          let leftSideFiller = ''

          if (licenceRecord.startDateString > responseJSON.startDateString) {
            fillerSize = cityssm.dateStringDifferenceInDays(
              responseJSON.startDateString,
              licenceRecord.startDateString
            )

            for (
              let fillerIndex = 0;
              fillerIndex < fillerSize;
              fillerIndex += 1
            ) {
              leftSideFiller += '<td></td>'
            }
          }

          let licenceColspan = 1

          if (licenceRecord.startDateString !== licenceRecord.endDateString) {
            licenceColspan = Math.min(
              7 - fillerSize,
              cityssm.dateStringDifferenceInDays(
                fillerSize === 0
                  ? responseJSON.startDateString
                  : licenceRecord.startDateString,
                licenceRecord.endDateString
              ) + 1
            )
          }

          let rightSideFiller = ''

          for (
            let fillerIndex = fillerSize + licenceColspan;
            fillerIndex < 7;
            fillerIndex += 1
          ) {
            rightSideFiller += '<td></td>'
          }

          const licenceType = licenceTypes[licenceRecord.licenceTypeKey] as
            | string
            | undefined

          // eslint-disable-next-line no-unsanitized/method
          licenceTbodyElement.insertAdjacentHTML(
            'beforeend',
            `<tr>
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
                      ${cityssm.escapeHTML(licenceType ?? licenceRecord.licenceTypeKey)}
                    </div>
                  </div>
                  <div class="columns mb-0 is-variable is-1">
                    <div class="column pb-2 is-narrow">
                      <i class="fas fa-fw fa-map-marker-alt" aria-hidden="true"></i>
                    </div>
                    <div class="column pb-2">
                      ${cityssm.escapeHTML(
                        licenceRecord.locationName === ''
                          ? licenceRecord.locationAddress1
                          : licenceRecord.locationName
                      )}
                    </div>
                  </div>
                  <div class="columns mb-0 is-variable is-1">
                    <div class="column pb-2 is-narrow">
                      <i class="fas fa-fw fa-users" aria-hidden="true"></i>
                    </div>
                    <div class="column pb-2">
                      ${cityssm.escapeHTML(licenceRecord.organizationName ?? '')}
                    </div>
                  </div>
                  <div class="columns is-variable is-1">
                    <div class="column is-narrow">
                      <i class="fas fa-fw fa-calendar" aria-hidden="true"></i>
                    </div>
                    <div class="column">
                      ${cityssm.escapeHTML(licenceRecord.startDateString)}
                      ${cityssm.escapeHTML(
                        licenceRecord.startDateString ===
                          licenceRecord.endDateString
                          ? ''
                          : ` to ${licenceRecord.endDateString}`
                      )}
                    </div>
                  </div>
                </a>
              </td>
              ${rightSideFiller}
            </tr>`
          )
        }

        tableElement.append(licenceTbodyElement)

        // Construct events tbody
        const eventTdElements = [
          document.createElement('td'),
          document.createElement('td'),
          document.createElement('td'),
          document.createElement('td'),
          document.createElement('td'),
          document.createElement('td'),
          document.createElement('td')
        ]

        for (const eventRecord of responseJSON.events) {
          const licenceType = licenceTypes[eventRecord.licenceTypeKey] as
            | string
            | undefined

          const tdIndex = cityssm
            .dateStringToDate(eventRecord.eventDateString)
            .getDay()

          // eslint-disable-next-line no-unsanitized/method
          eventTdElements[tdIndex].insertAdjacentHTML(
            'beforeend',
            `<a class="button mb-2 has-text-left is-small is-block has-height-auto is-wrap is-link is-light"
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
                  ${cityssm.escapeHTML(licenceType ?? eventRecord.licenceTypeKey)}
                </div>
              </div>
              <div class="columns mb-0 is-variable is-1">
                <div class="column pb-2 is-narrow">
                  <i class="fas fa-fw fa-map-marker-alt" aria-hidden="true"></i>
                </div>
                <div class="column pb-2">
                  ${cityssm.escapeHTML(
                    eventRecord.locationName === ''
                      ? eventRecord.locationAddress1
                      : eventRecord.locationName
                  )}
                </div>
              </div>
              <div class="columns mb-0 is-variable is-1">
                <div class="column pb-2 is-narrow">
                  <i class="fas fa-fw fa-users" aria-hidden="true"></i>
                </div>
                <div class="column pb-2">
                  ${cityssm.escapeHTML(eventRecord.organizationName ?? '')}
                </div>
              </div>
            </a>`
          )
        }

        const eventTrElement = document.createElement('tr')

        for (const eventTdElement of eventTdElements) {
          eventTrElement.append(eventTdElement)
        }

        const eventTbodyElement = document.createElement('tbody')
        eventTbodyElement.append(eventTrElement)

        tableElement.append(eventTbodyElement)

        // Display table
        eventContainerElement.append(tableElement)
      }
    )
  }

  eventDateFilterElement.addEventListener('change', refreshEventsFunction)

  refreshEventsFunction()

  showLicencesCheckboxElement.addEventListener('change', () => {
    if (showLicencesCheckboxElement.checked) {
      document.querySelector('#tbody--licences')?.classList.remove('is-hidden')
    } else {
      document.querySelector('#tbody--licences')?.classList.add('is-hidden')
    }
  })
})()
