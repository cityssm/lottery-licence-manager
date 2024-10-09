/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types'
import type { llmGlobal } from './types'

declare const cityssm: cityssmGlobal
declare const llm: llmGlobal

;(() => {
  const urlPrefix = document.querySelector('main').dataset.urlPrefix

  const formElement = document.querySelector(
    '#form--financialSummary'
  ) as HTMLFormElement

  const tableElement = document.querySelector(
    '#table--financialSummary'
  ) as HTMLTableElement
  const tbodyElement = tableElement.querySelector('tbody')
  const tfootElement = tableElement.querySelector('tfoot')

  const formatDollarsAsHTMLFunction = (dollarAmt: number) => {
    if (dollarAmt < 0) {
      return (
        '<span class="has-text-danger">($' +
        (dollarAmt * -1).toFixed(2) +
        ')</span>'
      )
    }

    return '$' + dollarAmt.toFixed(2)
  }

  const getFinancialSummaryFunction = () => {
    tableElement.classList.remove('has-status-view')
    tableElement.classList.add('has-status-loading')

    cityssm.postJSON(
      urlPrefix + '/events/doGetFinancialSummary',
      formElement,
      (
        summary: Array<{
          licenceTypeKey: string
          licenceCount: number
          eventCount: number
          reportDateCount: number
          licenceFeeSum: number
          costs_receiptsSum: number
          costs_adminSum: number
          costs_netProceedsSum: number
          costs_prizesAwardedSum: number
          costs_amountDonatedSum: number
        }>
      ) => {
        // Hide all rows

        const trElements = tbodyElement.children

        for (const trElement of trElements) {
          trElement.classList.add('is-hidden')
        }

        let licenceCount = 0
        let eventCount = 0
        let reportDateCount = 0
        let costs_receiptsSum = 0
        let costs_adminSum = 0
        let costs_prizesAwardedSum = 0
        let costs_netProceedsSum = 0
        let costs_amountDonatedSum = 0
        let licenceFeeSum = 0

        for (const licenceTypeSummaryObject of summary) {
          const trElement: HTMLTableRowElement = tbodyElement.querySelector(
            "tr[data-licence-type-key='" +
              licenceTypeSummaryObject.licenceTypeKey +
              "']"
          )

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          ;(
            trElement.querySelector(
              "[data-field='licenceCount']"
            ) as HTMLSpanElement
          ).textContent = licenceTypeSummaryObject.licenceCount.toString()

          licenceCount += licenceTypeSummaryObject.licenceCount

          trElement.querySelector("[data-field='eventCount']").innerHTML =
            (licenceTypeSummaryObject.reportDateCount ===
            licenceTypeSummaryObject.eventCount
              ? ''
              : '<span class="has-text-danger" data-tooltip="Events Unreported">') +
            licenceTypeSummaryObject.reportDateCount.toString() +
            '/' +
            licenceTypeSummaryObject.eventCount.toString() +
            (licenceTypeSummaryObject.reportDateCount ===
            licenceTypeSummaryObject.eventCount
              ? ''
              : '</span>')

          reportDateCount += licenceTypeSummaryObject.reportDateCount
          eventCount += licenceTypeSummaryObject.eventCount

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          ;(
            trElement.querySelector(
              "[data-field='costs_receiptsSum']"
            ) as HTMLSpanElement
          ).textContent =
            '$' + licenceTypeSummaryObject.costs_receiptsSum.toFixed(2)
          costs_receiptsSum += licenceTypeSummaryObject.costs_receiptsSum

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          ;(
            trElement.querySelector(
              "[data-field='costs_adminSum']"
            ) as HTMLSpanElement
          ).textContent =
            '$' + licenceTypeSummaryObject.costs_adminSum.toFixed(2)
          costs_adminSum += licenceTypeSummaryObject.costs_adminSum

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          ;(
            trElement.querySelector(
              "[data-field='costs_prizesAwardedSum']"
            ) as HTMLSpanElement
          ).textContent =
            '$' + licenceTypeSummaryObject.costs_prizesAwardedSum.toFixed(2)
          costs_prizesAwardedSum +=
            licenceTypeSummaryObject.costs_prizesAwardedSum

          trElement.querySelector(
            "[data-field='costs_netProceedsSum']"
          ).innerHTML = formatDollarsAsHTMLFunction(
            licenceTypeSummaryObject.costs_netProceedsSum
          )
          costs_netProceedsSum += licenceTypeSummaryObject.costs_netProceedsSum

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          ;(
            trElement.querySelector(
              "[data-field='costs_amountDonatedSum']"
            ) as HTMLSpanElement
          ).textContent =
            '$' + licenceTypeSummaryObject.costs_amountDonatedSum.toFixed(2)
          costs_amountDonatedSum +=
            licenceTypeSummaryObject.costs_amountDonatedSum

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          ;(
            trElement.querySelector(
              "[data-field='licenceFeeSum']"
            ) as HTMLSpanElement
          ).textContent =
            '$' + licenceTypeSummaryObject.licenceFeeSum.toFixed(2)

          licenceFeeSum += licenceTypeSummaryObject.licenceFeeSum

          trElement.classList.remove('is-hidden')
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        ;(
          tfootElement.querySelector(
            "[data-field='licenceCount']"
          ) as HTMLSpanElement
        ).textContent = licenceCount.toString()

        tfootElement.querySelector("[data-field='eventCount']").innerHTML =
          (reportDateCount === eventCount
            ? ''
            : '<span class="has-text-danger" data-tooltip="Events Unreported">') +
          reportDateCount.toString() +
          '/' +
          eventCount.toString() +
          (reportDateCount === eventCount ? '' : '</span>')

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        ;(
          tfootElement.querySelector(
            "[data-field='costs_receiptsSum']"
          ) as HTMLSpanElement
        ).textContent = '$' + costs_receiptsSum.toFixed(2)

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        ;(
          tfootElement.querySelector(
            "[data-field='costs_adminSum']"
          ) as HTMLSpanElement
        ).textContent = '$' + costs_adminSum.toFixed(2)

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        ;(
          tfootElement.querySelector(
            "[data-field='costs_prizesAwardedSum']"
          ) as HTMLSpanElement
        ).textContent = '$' + costs_prizesAwardedSum.toFixed(2)

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        tfootElement.querySelector(
          "[data-field='costs_netProceedsSum']"
        ).innerHTML = formatDollarsAsHTMLFunction(costs_netProceedsSum)

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        ;(
          tfootElement.querySelector(
            "[data-field='costs_amountDonatedSum']"
          ) as HTMLSpanElement
        ).textContent = '$' + costs_amountDonatedSum.toFixed(2)

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        ;(
          tfootElement.querySelector(
            "[data-field='licenceFeeSum']"
          ) as HTMLSpanElement
        ).textContent = '$' + licenceFeeSum.toFixed(2)

        tableElement.classList.remove('has-status-loading')
        tableElement.classList.add('has-status-view')
      }
    )
  }

  llm.initializeDateRangeSelector(
    document.querySelector(
      ".is-date-range-selector[data-field-key='eventDate']"
    ),
    getFinancialSummaryFunction
  )

  getFinancialSummaryFunction()
})()
