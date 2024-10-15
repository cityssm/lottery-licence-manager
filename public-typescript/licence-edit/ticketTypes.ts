import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types'

import type { DoGetTicketTypesResponse } from '../../handlers/licences-post/doGetTicketTypes.js'
import type * as configTypes from '../../types/configTypes.js'
import type * as recordTypes from '../../types/recordTypes.js'
import type { llmGlobal } from '../types.js'

declare const cityssm: cityssmGlobal
declare const llm: llmGlobal
declare const bulmaJS: BulmaJS

if (document.querySelector('#is-ticket-types-panel') !== null) {
  const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? ''

  const formElement = document.querySelector(
    '#form--licence'
  ) as HTMLFormElement
  const licenceID = (
    document.querySelector('#licence--licenceID') as HTMLInputElement
  ).value
  const isCreate = licenceID === ''

  const ticketTypesPanelElement = document.querySelector(
    '#is-ticket-types-panel'
  )

  const licenceTypeSelectElement = document.querySelector(
    '#licence--licenceTypeKey'
  ) as HTMLSelectElement

  /*
   * Caches
   */

  const licenceTypeKeyToTicketTypesCache = new Map<
    string,
    configTypes.ConfigTicketType[]
  >()

  function loadTicketTypesCache(
    callbackFunction: (ticketTypes: configTypes.ConfigTicketType[]) => void
  ): void {
    const licenceTypeKey = licenceTypeSelectElement.value

    if (licenceTypeKeyToTicketTypesCache.has(licenceTypeKey)) {
      callbackFunction(
        licenceTypeKeyToTicketTypesCache.get(
          licenceTypeKey
        ) as configTypes.ConfigTicketType[]
      )
    } else {
      cityssm.postJSON(
        `${urlPrefix}/licences/doGetTicketTypes`,
        {
          licenceTypeKey
        },
        (rawResponseJSON) => {
          const ticketTypes =
            rawResponseJSON as unknown as DoGetTicketTypesResponse
          licenceTypeKeyToTicketTypesCache.set(licenceTypeKey, ticketTypes)
          callbackFunction(ticketTypes)
        }
      )
    }
  }

  const distributorLocationsCache: recordTypes.Location[] = []
  let distributorLocationsIdToNameCache: Map<number, string>

  const manufacturerLocationsCache: recordTypes.Location[] = []
  let manufacturerLocationsIdToNameCache: Map<number, string>

  function loadDistributorLocationsCache(
    callbackFunction: (locationList: recordTypes.Location[]) => void
  ): void {
    if (distributorLocationsCache.length === 0) {
      llm.licenceEdit.loadLocationListFunction((locationList) => {
        distributorLocationsIdToNameCache = new Map<number, string>()

        for (const location of locationList) {
          if (location.locationIsDistributor) {
            distributorLocationsCache.push(location)
            distributorLocationsIdToNameCache.set(
              location.locationID,
              location.locationDisplayName
            )
          }
        }

        callbackFunction(distributorLocationsCache)
      })
    } else {
      callbackFunction(distributorLocationsCache)
    }
  }

  function loadManufacturerLocationsCache(
    callbackFunction: (locationList: recordTypes.Location[]) => void
  ): void {
    if (manufacturerLocationsCache.length === 0) {
      llm.licenceEdit.loadLocationListFunction(
        (locationList: recordTypes.Location[]) => {
          manufacturerLocationsIdToNameCache = new Map<number, string>()

          for (const location of locationList) {
            if (location.locationIsManufacturer) {
              manufacturerLocationsCache.push(location)
              manufacturerLocationsIdToNameCache.set(
                location.locationID,
                location.locationDisplayName
              )
            }
          }

          callbackFunction(manufacturerLocationsCache)
        }
      )
    } else {
      callbackFunction(manufacturerLocationsCache)
    }
  }

  /*
   * Tables
   */

  const summaryTableElement = document.querySelector(
    '#ticketTypesTabPanel--summary'
  ) as HTMLTableElement

  const summaryTableTbodyElement = summaryTableElement.querySelector(
    'tbody'
  ) as HTMLTableSectionElement
  const summaryTableTFootElement = summaryTableElement.querySelector(
    'tfoot'
  ) as HTMLTableSectionElement

  const logTableElement = document.querySelector(
    '#ticketTypesTabPanel--log'
  ) as HTMLTableElement

  const logTableTbodyElement = logTableElement.querySelector(
    'tbody'
  ) as HTMLTableSectionElement
  const logTableTFootElement = logTableElement.querySelector(
    'tfoot'
  ) as HTMLTableSectionElement

  let lastUsedDistributorID = ''
  let lastUsedManufacturerID = ''

  if (logTableTbodyElement.querySelectorAll('tr').length > 0) {
    const trElements = logTableTbodyElement.querySelectorAll('tr')
    const lastTrElement = trElements.at(-1)

    lastUsedDistributorID = lastTrElement.dataset.distributorId
    lastUsedManufacturerID = lastTrElement.dataset.manufacturerId
  }

  function renderSummaryTable(): void {
    // sum up the log rows
    const ticketTypeTotals = new Map<
      string,
      {
        totalUnits: number
        totalValue: number
        totalPrizes: number
        totalLicenceFee: number
      }
    >()

    const logTrElements = logTableTbodyElement.querySelectorAll('tr')

    for (const logTrElement of logTrElements) {
      const ticketType = logTrElement.dataset.ticketType ?? ''

      let totalUnits = Number.parseInt(logTrElement.dataset.unitCount, 10)
      let totalValue = Number.parseFloat(logTrElement.dataset.totalValue)
      let totalPrizes = Number.parseFloat(logTrElement.dataset.totalPrizes)
      let totalLicenceFee = Number.parseFloat(logTrElement.dataset.licenceFee)

      if (ticketTypeTotals.has(ticketType)) {
        totalUnits += ticketTypeTotals.get(ticketType)?.totalUnits ?? 0
        totalValue += ticketTypeTotals.get(ticketType)?.totalValue ?? 0
        totalPrizes += ticketTypeTotals.get(ticketType)?.totalPrizes ?? 0
        totalLicenceFee +=
          ticketTypeTotals.get(ticketType)?.totalLicenceFee ?? 0
      }

      ticketTypeTotals.set(ticketType, {
        totalUnits,
        totalValue,
        totalPrizes,
        totalLicenceFee
      })
    }

    // sort ticket types
    const ticketTypes: string[] = []

    for (const ticketType of ticketTypeTotals.keys()) {
      ticketTypes.push(ticketType)
    }

    ticketTypes.sort()

    // update summary table body
    cityssm.clearElement(summaryTableTbodyElement)

    const grandTotals = {
      totalUnits: 0,
      totalValue: 0,
      totalPrizes: 0,
      totalLicenceFee: 0
    }

    for (const ticketType of ticketTypes) {
      const rowTotals = ticketTypeTotals.get(ticketType)

      grandTotals.totalUnits += rowTotals?.totalUnits ?? 0
      grandTotals.totalValue += rowTotals?.totalValue ?? 0
      grandTotals.totalPrizes += rowTotals?.totalPrizes ?? 0
      grandTotals.totalLicenceFee += rowTotals?.totalLicenceFee ?? 0

      const summaryTrElement = document.createElement('tr')

      // eslint-disable-next-line no-unsanitized/property
      summaryTrElement.innerHTML = `<td>${cityssm.escapeHTML(ticketType)}</td>
        <td class="has-text-right">${rowTotals?.totalUnits.toString()}</td>
        <td class="has-text-right">${llm.formatDollarsAsHTML(rowTotals?.totalValue ?? 0)}</td>
        <td class="has-text-right">${llm.formatDollarsAsHTML(rowTotals?.totalPrizes ?? 0)}</td>
        <td class="has-text-right">${llm.formatDollarsAsHTML(rowTotals?.totalLicenceFee ?? 0)}</td>`

      summaryTableTbodyElement.append(summaryTrElement)
    }

    // update summary table footer
    // eslint-disable-next-line no-unsanitized/property
    summaryTableTFootElement.innerHTML = `<td></td>
      <th class="has-text-right">${grandTotals.totalUnits.toString()}</th>
      <th class="has-text-right">${llm.formatDollarsAsHTML(grandTotals.totalValue)}</th>
      <th class="has-text-right">${llm.formatDollarsAsHTML(grandTotals.totalPrizes)}</th>
      <th class="has-text-right">${llm.formatDollarsAsHTML(grandTotals.totalLicenceFee)}</th>`

    // update log table footer
    // eslint-disable-next-line no-unsanitized/property
    logTableTFootElement.innerHTML = `<td></td>
      <td></td>
      <th class="has-text-right">${grandTotals.totalUnits.toString()}</th>
      <th class="has-text-right">${llm.formatDollarsAsHTML(grandTotals.totalValue)}</th>
      <th class="has-text-right">${llm.formatDollarsAsHTML(grandTotals.totalPrizes)}</th>
      <th class="has-text-right">${llm.formatDollarsAsHTML(grandTotals.totalLicenceFee)}</th>
      <td></td>
      <td class="is-hidden-print"></td>`
    ;(
      document.querySelector('#licence--totalPrizeValue') as HTMLInputElement
    ).value = grandTotals.totalPrizes.toFixed(2)
  }

  function addLogTableRow(object: {
    ticketType: string
    unitCount: number
    licenceFee: number
    prizesPerDeal: number
    valuePerDeal: number
    distributorLocationID: number
    manufacturerLocationID: number
  }): void {
    /*
     * Calculate values
     */
    const ticketType = object.ticketType

    const unitCount = object.unitCount

    const valuePerDeal = object.valuePerDeal
    const totalValuePerDeal = (valuePerDeal * unitCount).toFixed(2)

    const prizesPerDeal = object.prizesPerDeal
    const totalPrizesPerDeal = (prizesPerDeal * unitCount).toFixed(2)

    const licenceFee = object.licenceFee

    /*
     * Build row
     */
    const trElement = document.createElement('tr')

    trElement.className = 'has-background-success-light'

    trElement.dataset.ticketTypeIndex = ''
    trElement.dataset.ticketType = ticketType
    trElement.dataset.unitCount = unitCount.toString()
    trElement.dataset.totalValue = totalValuePerDeal.toString()
    trElement.dataset.totalPrizes = totalPrizesPerDeal.toString()
    trElement.dataset.licenceFee = object.licenceFee.toString()

    trElement.insertAdjacentHTML(
      'beforeend',
      `<td>
        <input name="ticketType_ticketTypeIndex" type="hidden" value="" />
        <input name="ticketType_amendmentDate" type="hidden" value="" />
        <span>(New Record)</span>
        </td>`
    )

    trElement.insertAdjacentHTML(
      'beforeend',
      `<td>
        <input name="ticketType_ticketType" type="hidden" value="${cityssm.escapeHTML(ticketType)}" />
        <span>${cityssm.escapeHTML(ticketType)}</span>
        </td>`
    )

    // Unit count
    // eslint-disable-next-line no-unsanitized/method
    trElement.insertAdjacentHTML(
      'beforeend',
      `<td class="has-text-right">
        <input name="ticketType_unitCount" type="hidden" value="${unitCount.toString()}" />
        <span>${unitCount.toString()}</span>
        </td>`
    )

    // Value per deal
    // eslint-disable-next-line no-unsanitized/method
    trElement.insertAdjacentHTML(
      'beforeend',
      `<td class="has-text-right is-nowrap">
        <input class="is-total-value-per-deal" type="hidden" value="${totalValuePerDeal.toString()}" />
        <span data-tooltip="$${valuePerDeal.toFixed(2)} value per deal">
          $ ${totalValuePerDeal}
        </span>
        </td>`
    )

    // Prizes per deal
    // eslint-disable-next-line no-unsanitized/method
    trElement.insertAdjacentHTML(
      'beforeend',
      `<td class="has-text-right is-nowrap">
        <input class="is-total-prizes-per-deal" type="hidden" value="${totalPrizesPerDeal.toString()}" />
        <span data-tooltip="$${prizesPerDeal.toFixed(2)} prizes per deal">
          $ ${totalPrizesPerDeal}
        </span>
        </td>`
    )

    // Licence fee
    // eslint-disable-next-line no-unsanitized/method
    trElement.insertAdjacentHTML(
      'beforeend',
      `<td class="has-text-right is-nowrap">
        <input class="is-licence-fee" name="ticketType_licenceFee" type="hidden" value="${licenceFee.toString()}" />
        <span>$${licenceFee.toFixed(2)}</span>
        </td>`
    )

    // Manufacturer / Distributor
    const manufacturerLocationDisplayName =
      manufacturerLocationsIdToNameCache.get(object.manufacturerLocationID)
    const distributorLocationDisplayName =
      distributorLocationsIdToNameCache.get(object.distributorLocationID)

    lastUsedDistributorID = object.distributorLocationID.toString()
    lastUsedManufacturerID = object.manufacturerLocationID.toString()

    // eslint-disable-next-line no-unsanitized/method
    trElement.insertAdjacentHTML(
      'beforeend',
      `<td class="is-size-7">
        <input name="ticketType_manufacturerLocationID" type="hidden"
          value="${object.manufacturerLocationID.toString()}" />
        <input name="ticketType_distributorLocationID" type="hidden"
          value="${object.distributorLocationID.toString()}" />
        <span>${cityssm.escapeHTML(manufacturerLocationDisplayName)}<span><br />
        <span>${cityssm.escapeHTML(distributorLocationDisplayName)}<span></td>`
    )

    // Delete
    trElement.insertAdjacentHTML(
      'beforeend',
      `<td class="is-hidden-print">
        <button class="button is-small is-danger has-tooltip-left is-delete-ticket-type-button" data-tooltip="Delete Ticket Type" type="button">
          <i class="fas fa-trash" aria-hidden="true"></i>
          <span class="sr-only">Delete</span>
        </button>
        </td>`
    )

    trElement
      .querySelector('.is-delete-ticket-type-button')
      ?.addEventListener('click', deleteTicketTypeFunction_openConfirm)

    // Insert row
    logTableTbodyElement.prepend(trElement)

    renderSummaryTable()

    llm.licenceEdit.setUnsavedChangesFunction()
    llm.licenceEdit.setDoRefreshAfterSaveFunction()
  }

  function deleteTicketTypeFunction_doDeleteTicketType(
    trElement: HTMLTableRowElement
  ): void {
    const ticketTypeIndex = trElement.dataset.ticketTypeIndex as string

    trElement.remove()

    if (!isCreate) {
      formElement.insertAdjacentHTML(
        'beforeend',
        `<input class="is-removed-after-save" name="ticketTypeIndex_toDelete" type="hidden"
          value="${cityssm.escapeHTML(ticketTypeIndex)}" />`
      )
    }

    renderSummaryTable()

    llm.licenceEdit.setUnsavedChangesFunction()
    llm.licenceEdit.setDoRefreshAfterSaveFunction()
  }

  function deleteTicketTypeFunction_openConfirm(buttonEvent: Event): void {
    const trElement = (buttonEvent.currentTarget as HTMLButtonElement).closest(
      'tr'
    ) as HTMLTableRowElement

    const ticketType = trElement.dataset.ticketType

    cityssm.confirmModal(
      'Delete Ticket Type?',
      `Are you sure you want to remove the ${ticketType} ticket type for this licence?`,
      'Yes, Delete',
      'danger',
      () => {
        deleteTicketTypeFunction_doDeleteTicketType(trElement)
      }
    )
  }

  function addTicketType_openModal(clickEvent: Event): void {
    const ticketTypeFieldPresets = {
      manufacturerLocationId: lastUsedManufacturerID,
      distributorLocationId: lastUsedDistributorID,
      ticketType: '',
      unitCount: '1'
    }

    let deleteTicketType_trElement: HTMLTableRowElement

    if (
      (clickEvent.currentTarget as HTMLButtonElement).id !==
      'is-add-ticket-type-button'
    ) {
      deleteTicketType_trElement = (
        clickEvent.currentTarget as HTMLButtonElement
      ).closest('tr')

      ticketTypeFieldPresets.manufacturerLocationId =
        deleteTicketType_trElement.dataset.manufacturerId
      ticketTypeFieldPresets.distributorLocationId =
        deleteTicketType_trElement.dataset.distributorId
      ticketTypeFieldPresets.ticketType =
        deleteTicketType_trElement.dataset.ticketType
      ticketTypeFieldPresets.unitCount =
        deleteTicketType_trElement.dataset.unitCount
    }

    let addTicketType_closeModalFunction: () => void
    let addTicketType_ticketTypeElement: HTMLSelectElement
    let addTicketType_unitCountElement: HTMLInputElement

    const addTicketTypeFunction_addTicketType = (formEvent: Event) => {
      formEvent.preventDefault()

      addLogTableRow({
        ticketType: (
          document.querySelector(
            '#ticketTypeAdd--ticketType'
          ) as HTMLInputElement
        ).value,
        unitCount: Number.parseInt(
          (
            document.querySelector(
              '#ticketTypeAdd--unitCount'
            ) as HTMLInputElement
          ).value,
          10
        ),
        valuePerDeal: Number.parseFloat(
          (
            document.querySelector(
              '#ticketTypeAdd--valuePerDeal'
            ) as HTMLInputElement
          ).value
        ),
        prizesPerDeal: Number.parseFloat(
          (
            document.querySelector(
              '#ticketTypeAdd--prizesPerDeal'
            ) as HTMLInputElement
          ).value
        ),
        licenceFee: Number.parseFloat(
          (
            document.querySelector(
              '#ticketTypeAdd--licenceFee'
            ) as HTMLInputElement
          ).value
        ),
        distributorLocationID: Number.parseInt(
          (
            document.querySelector(
              '#ticketTypeAdd--distributorLocationID'
            ) as HTMLSelectElement
          ).value,
          10
        ),
        manufacturerLocationID: Number.parseInt(
          (
            document.querySelector(
              '#ticketTypeAdd--manufacturerLocationID'
            ) as HTMLSelectElement
          ).value,
          10
        )
      })

      if (deleteTicketType_trElement) {
        deleteTicketTypeFunction_doDeleteTicketType(deleteTicketType_trElement)
      }

      addTicketType_closeModalFunction()
    }

    const addTicketTypeFunction_refreshUnitCountChange = () => {
      const unitCount = Number.parseInt(
        addTicketType_unitCountElement.value,
        10
      )
      ;(
        document.querySelector(
          '#ticketTypeAdd--prizesTotal'
        ) as HTMLInputElement
      ).value = (
        Number.parseFloat(
          (
            document.querySelector(
              '#ticketTypeAdd--prizesPerDeal'
            ) as HTMLInputElement
          ).value
        ) * unitCount
      ).toFixed(2)
      ;(
        document.querySelector('#ticketTypeAdd--licenceFee') as HTMLInputElement
      ).value = (
        Number.parseFloat(
          (
            document.querySelector(
              '#ticketTypeAdd--feePerUnit'
            ) as HTMLInputElement
          ).value
        ) * unitCount
      ).toFixed(2)
    }

    const addTicketTypeFunction_refreshTicketTypeChange = () => {
      const ticketTypeOptionElement =
        addTicketType_ticketTypeElement.selectedOptions[0]
      ;(
        document.querySelector(
          '#ticketTypeAdd--ticketPrice'
        ) as HTMLInputElement
      ).value = ticketTypeOptionElement.dataset.ticketPrice
      ;(
        document.querySelector(
          '#ticketTypeAdd--ticketCount'
        ) as HTMLInputElement
      ).value = ticketTypeOptionElement.dataset.ticketCount
      ;(
        document.querySelector(
          '#ticketTypeAdd--valuePerDeal'
        ) as HTMLInputElement
      ).value = (
        Number.parseFloat(ticketTypeOptionElement.dataset.ticketPrice) *
        Number.parseInt(ticketTypeOptionElement.dataset.ticketCount, 10)
      ).toFixed(2)
      ;(
        document.querySelector(
          '#ticketTypeAdd--prizesPerDeal'
        ) as HTMLInputElement
      ).value = ticketTypeOptionElement.dataset.prizesPerDeal
      ;(
        document.querySelector('#ticketTypeAdd--feePerUnit') as HTMLInputElement
      ).value = ticketTypeOptionElement.dataset.feePerUnit

      addTicketTypeFunction_refreshUnitCountChange()
    }

    const addTicketTypeFunction_populateTicketTypeSelect = () => {
      loadTicketTypesCache((ticketTypes) => {
        if (!ticketTypes || ticketTypes.length === 0) {
          addTicketType_closeModalFunction()
          cityssm.alertModal('No ticket types available', '', 'OK', 'danger')
          return
        }

        addTicketType_ticketTypeElement.innerHTML = ''

        for (const ticketTypeObject of ticketTypes) {
          const optionElement = document.createElement('option')

          optionElement.dataset.ticketPrice =
            ticketTypeObject.ticketPrice.toFixed(2)
          optionElement.dataset.ticketCount =
            ticketTypeObject.ticketCount.toString()
          optionElement.dataset.prizesPerDeal =
            ticketTypeObject.prizesPerDeal.toFixed(2)
          optionElement.dataset.feePerUnit = (
            ticketTypeObject.feePerUnit || 0
          ).toFixed(2)

          optionElement.value = ticketTypeObject.ticketType

          optionElement.textContent =
            ticketTypeObject.ticketType +
            ' (' +
            ticketTypeObject.ticketCount.toString() +
            ' tickets,' +
            ' $' +
            ticketTypeObject.ticketPrice.toFixed(2) +
            ' each)'

          addTicketType_ticketTypeElement.append(optionElement)
        }

        if (ticketTypeFieldPresets.ticketType !== '') {
          addTicketType_ticketTypeElement.value =
            ticketTypeFieldPresets.ticketType
        }

        addTicketTypeFunction_refreshTicketTypeChange()
      })
    }

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const addTicketTypeFunction_populateDistributorSelect = () => {
      loadDistributorLocationsCache((locations) => {
        const selectElement = document.querySelector(
          '#ticketTypeAdd--distributorLocationID'
        ) as HTMLSelectElement

        selectElement.innerHTML = '<option value="">(No Distributor)</option>'

        for (const location of locations) {
          selectElement.insertAdjacentHTML(
            'beforeend',
            `<option value="${cityssm.escapeHTML(location.locationID.toString())}">
              ${cityssm.escapeHTML(location.locationDisplayName)}
              </option>`
          )
        }

        if (
          ticketTypeFieldPresets.distributorLocationId !== '' &&
          selectElement.querySelector(`[value='${lastUsedDistributorID}']`) !==
            null
        ) {
          selectElement.value = ticketTypeFieldPresets.distributorLocationId
        }
      })
    }

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const addTicketTypeFunction_populateManufacturerSelect = () => {
      loadManufacturerLocationsCache((locations) => {
        const selectElement = document.querySelector(
          '#ticketTypeAdd--manufacturerLocationID'
        ) as HTMLSelectElement

        selectElement.innerHTML = '<option value="">(No Manufacturer)</option>'

        for (const location of locations) {
          selectElement.insertAdjacentHTML(
            'beforeend',
            `<option value="${cityssm.escapeHTML(location.locationID.toString())}">
              ${cityssm.escapeHTML(location.locationDisplayName)}
              </option>`
          )
        }

        if (
          ticketTypeFieldPresets.manufacturerLocationId !== '' &&
          selectElement.querySelector(`[value='${lastUsedManufacturerID}']`) !==
            null
        ) {
          selectElement.value = ticketTypeFieldPresets.manufacturerLocationId
        }
      })
    }

    cityssm.openHtmlModal('licence-ticketTypeAdd', {
      onshow(modalElement) {
        addTicketType_ticketTypeElement = modalElement.querySelector(
          '#ticketTypeAdd--ticketType'
        ) as HTMLSelectElement
        addTicketType_unitCountElement = modalElement.querySelector(
          '#ticketTypeAdd--unitCount'
        ) as HTMLInputElement

        addTicketTypeFunction_populateDistributorSelect()
        addTicketTypeFunction_populateManufacturerSelect()
        addTicketTypeFunction_populateTicketTypeSelect()

        if (ticketTypeFieldPresets.unitCount !== '') {
          addTicketType_unitCountElement.value =
            ticketTypeFieldPresets.unitCount
          addTicketTypeFunction_refreshUnitCountChange()
        }

        if (deleteTicketType_trElement) {
          modalElement.querySelector('.modal-card-title').textContent =
            'Edit a Ticket Type'

          modalElement.querySelector('.modal-card-body')?.insertAdjacentHTML(
            'afterbegin',
            `<div class="message is-warning">
              <p class="message-body">
                Note that editing ticket type records can negatively impact your historical reporting.
              </p>
              </div>`
          )

          modalElement.querySelector(
            ".modal-card-foot .button[type='submit']"
          ).innerHTML =
            `<span class="icon"><i class="fas fa-save" aria-hidden="true"></i></span>
              <span>Edit Ticket Type</span>`
        }

        addTicketType_ticketTypeElement.addEventListener(
          'change',
          addTicketTypeFunction_refreshTicketTypeChange
        )
        addTicketType_unitCountElement.addEventListener(
          'change',
          addTicketTypeFunction_refreshUnitCountChange
        )

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', addTicketTypeFunction_addTicketType)
      },

      onshown(_modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        addTicketType_closeModalFunction = closeModalFunction
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  // initialize

  renderSummaryTable()

  document
    .querySelector('#is-add-ticket-type-button')
    ?.addEventListener('click', addTicketType_openModal)

  // edit buttons

  const editButtonElements = ticketTypesPanelElement.querySelectorAll(
    '.is-edit-ticket-type-button'
  )

  for (const editButtonElement of editButtonElements) {
    editButtonElement.addEventListener('click', addTicketType_openModal)
  }

  // delete buttons

  const deleteButtonElements = ticketTypesPanelElement.querySelectorAll(
    '.is-delete-ticket-type-button'
  )

  for (const deleteButtonElement of deleteButtonElements) {
    deleteButtonElement.addEventListener(
      'click',
      deleteTicketTypeFunction_openConfirm
    )
  }
}
