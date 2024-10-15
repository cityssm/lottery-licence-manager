"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
if (document.querySelector('#is-ticket-types-panel') !== null) {
    const urlPrefix = (_b = (_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.urlPrefix) !== null && _b !== void 0 ? _b : '';
    const formElement = document.querySelector('#form--licence');
    const licenceID = document.querySelector('#licence--licenceID').value;
    const isCreate = licenceID === '';
    const ticketTypesPanelElement = document.querySelector('#is-ticket-types-panel');
    const licenceTypeSelectElement = document.querySelector('#licence--licenceTypeKey');
    const licenceTypeKeyToTicketTypesCache = new Map();
    function loadTicketTypesCache(callbackFunction) {
        const licenceTypeKey = licenceTypeSelectElement.value;
        if (licenceTypeKeyToTicketTypesCache.has(licenceTypeKey)) {
            callbackFunction(licenceTypeKeyToTicketTypesCache.get(licenceTypeKey));
        }
        else {
            cityssm.postJSON(`${urlPrefix}/licences/doGetTicketTypes`, {
                licenceTypeKey
            }, (rawResponseJSON) => {
                const ticketTypes = rawResponseJSON;
                licenceTypeKeyToTicketTypesCache.set(licenceTypeKey, ticketTypes);
                callbackFunction(ticketTypes);
            });
        }
    }
    const distributorLocationsCache = [];
    let distributorLocationsIdToNameCache;
    const manufacturerLocationsCache = [];
    let manufacturerLocationsIdToNameCache;
    function loadDistributorLocationsCache(callbackFunction) {
        if (distributorLocationsCache.length === 0) {
            llm.licenceEdit.loadLocationListFunction((locationList) => {
                distributorLocationsIdToNameCache = new Map();
                for (const location of locationList) {
                    if (location.locationIsDistributor) {
                        distributorLocationsCache.push(location);
                        distributorLocationsIdToNameCache.set(location.locationID, location.locationDisplayName);
                    }
                }
                callbackFunction(distributorLocationsCache);
            });
        }
        else {
            callbackFunction(distributorLocationsCache);
        }
    }
    function loadManufacturerLocationsCache(callbackFunction) {
        if (manufacturerLocationsCache.length === 0) {
            llm.licenceEdit.loadLocationListFunction((locationList) => {
                manufacturerLocationsIdToNameCache = new Map();
                for (const location of locationList) {
                    if (location.locationIsManufacturer) {
                        manufacturerLocationsCache.push(location);
                        manufacturerLocationsIdToNameCache.set(location.locationID, location.locationDisplayName);
                    }
                }
                callbackFunction(manufacturerLocationsCache);
            });
        }
        else {
            callbackFunction(manufacturerLocationsCache);
        }
    }
    const summaryTableElement = document.querySelector('#ticketTypesTabPanel--summary');
    const summaryTableTbodyElement = summaryTableElement.querySelector('tbody');
    const summaryTableTFootElement = summaryTableElement.querySelector('tfoot');
    const logTableElement = document.querySelector('#ticketTypesTabPanel--log');
    const logTableTbodyElement = logTableElement.querySelector('tbody');
    const logTableTFootElement = logTableElement.querySelector('tfoot');
    let lastUsedDistributorID = '';
    let lastUsedManufacturerID = '';
    if (logTableTbodyElement.querySelectorAll('tr').length > 0) {
        const trElements = logTableTbodyElement.querySelectorAll('tr');
        const lastTrElement = trElements.at(-1);
        lastUsedDistributorID = lastTrElement.dataset.distributorId;
        lastUsedManufacturerID = lastTrElement.dataset.manufacturerId;
    }
    function renderSummaryTable() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        const ticketTypeTotals = new Map();
        const logTrElements = logTableTbodyElement.querySelectorAll('tr');
        for (const logTrElement of logTrElements) {
            const ticketType = (_a = logTrElement.dataset.ticketType) !== null && _a !== void 0 ? _a : '';
            let totalUnits = Number.parseInt(logTrElement.dataset.unitCount, 10);
            let totalValue = Number.parseFloat(logTrElement.dataset.totalValue);
            let totalPrizes = Number.parseFloat(logTrElement.dataset.totalPrizes);
            let totalLicenceFee = Number.parseFloat(logTrElement.dataset.licenceFee);
            if (ticketTypeTotals.has(ticketType)) {
                totalUnits += (_c = (_b = ticketTypeTotals.get(ticketType)) === null || _b === void 0 ? void 0 : _b.totalUnits) !== null && _c !== void 0 ? _c : 0;
                totalValue += (_e = (_d = ticketTypeTotals.get(ticketType)) === null || _d === void 0 ? void 0 : _d.totalValue) !== null && _e !== void 0 ? _e : 0;
                totalPrizes += (_g = (_f = ticketTypeTotals.get(ticketType)) === null || _f === void 0 ? void 0 : _f.totalPrizes) !== null && _g !== void 0 ? _g : 0;
                totalLicenceFee +=
                    (_j = (_h = ticketTypeTotals.get(ticketType)) === null || _h === void 0 ? void 0 : _h.totalLicenceFee) !== null && _j !== void 0 ? _j : 0;
            }
            ticketTypeTotals.set(ticketType, {
                totalUnits,
                totalValue,
                totalPrizes,
                totalLicenceFee
            });
        }
        const ticketTypes = [];
        for (const ticketType of ticketTypeTotals.keys()) {
            ticketTypes.push(ticketType);
        }
        ticketTypes.sort();
        cityssm.clearElement(summaryTableTbodyElement);
        const grandTotals = {
            totalUnits: 0,
            totalValue: 0,
            totalPrizes: 0,
            totalLicenceFee: 0
        };
        for (const ticketType of ticketTypes) {
            const rowTotals = ticketTypeTotals.get(ticketType);
            grandTotals.totalUnits += (_k = rowTotals === null || rowTotals === void 0 ? void 0 : rowTotals.totalUnits) !== null && _k !== void 0 ? _k : 0;
            grandTotals.totalValue += (_l = rowTotals === null || rowTotals === void 0 ? void 0 : rowTotals.totalValue) !== null && _l !== void 0 ? _l : 0;
            grandTotals.totalPrizes += (_m = rowTotals === null || rowTotals === void 0 ? void 0 : rowTotals.totalPrizes) !== null && _m !== void 0 ? _m : 0;
            grandTotals.totalLicenceFee += (_o = rowTotals === null || rowTotals === void 0 ? void 0 : rowTotals.totalLicenceFee) !== null && _o !== void 0 ? _o : 0;
            const summaryTrElement = document.createElement('tr');
            summaryTrElement.innerHTML = `<td>${cityssm.escapeHTML(ticketType)}</td>
        <td class="has-text-right">${rowTotals === null || rowTotals === void 0 ? void 0 : rowTotals.totalUnits.toString()}</td>
        <td class="has-text-right">${llm.formatDollarsAsHTML((_p = rowTotals === null || rowTotals === void 0 ? void 0 : rowTotals.totalValue) !== null && _p !== void 0 ? _p : 0)}</td>
        <td class="has-text-right">${llm.formatDollarsAsHTML((_q = rowTotals === null || rowTotals === void 0 ? void 0 : rowTotals.totalPrizes) !== null && _q !== void 0 ? _q : 0)}</td>
        <td class="has-text-right">${llm.formatDollarsAsHTML((_r = rowTotals === null || rowTotals === void 0 ? void 0 : rowTotals.totalLicenceFee) !== null && _r !== void 0 ? _r : 0)}</td>`;
            summaryTableTbodyElement.append(summaryTrElement);
        }
        summaryTableTFootElement.innerHTML = `<td></td>
      <th class="has-text-right">${grandTotals.totalUnits.toString()}</th>
      <th class="has-text-right">${llm.formatDollarsAsHTML(grandTotals.totalValue)}</th>
      <th class="has-text-right">${llm.formatDollarsAsHTML(grandTotals.totalPrizes)}</th>
      <th class="has-text-right">${llm.formatDollarsAsHTML(grandTotals.totalLicenceFee)}</th>`;
        logTableTFootElement.innerHTML = `<td></td>
      <td></td>
      <th class="has-text-right">${grandTotals.totalUnits.toString()}</th>
      <th class="has-text-right">${llm.formatDollarsAsHTML(grandTotals.totalValue)}</th>
      <th class="has-text-right">${llm.formatDollarsAsHTML(grandTotals.totalPrizes)}</th>
      <th class="has-text-right">${llm.formatDollarsAsHTML(grandTotals.totalLicenceFee)}</th>
      <td></td>
      <td class="is-hidden-print"></td>`;
        document.querySelector('#licence--totalPrizeValue').value = grandTotals.totalPrizes.toFixed(2);
    }
    function addLogTableRow(object) {
        var _a;
        const ticketType = object.ticketType;
        const unitCount = object.unitCount;
        const valuePerDeal = object.valuePerDeal;
        const totalValuePerDeal = (valuePerDeal * unitCount).toFixed(2);
        const prizesPerDeal = object.prizesPerDeal;
        const totalPrizesPerDeal = (prizesPerDeal * unitCount).toFixed(2);
        const licenceFee = object.licenceFee;
        const trElement = document.createElement('tr');
        trElement.className = 'has-background-success-light';
        trElement.dataset.ticketTypeIndex = '';
        trElement.dataset.ticketType = ticketType;
        trElement.dataset.unitCount = unitCount.toString();
        trElement.dataset.totalValue = totalValuePerDeal.toString();
        trElement.dataset.totalPrizes = totalPrizesPerDeal.toString();
        trElement.dataset.licenceFee = object.licenceFee.toString();
        trElement.insertAdjacentHTML('beforeend', `<td>
        <input name="ticketType_ticketTypeIndex" type="hidden" value="" />
        <input name="ticketType_amendmentDate" type="hidden" value="" />
        <span>(New Record)</span>
        </td>`);
        trElement.insertAdjacentHTML('beforeend', `<td>
        <input name="ticketType_ticketType" type="hidden" value="${cityssm.escapeHTML(ticketType)}" />
        <span>${cityssm.escapeHTML(ticketType)}</span>
        </td>`);
        trElement.insertAdjacentHTML('beforeend', `<td class="has-text-right">
        <input name="ticketType_unitCount" type="hidden" value="${unitCount.toString()}" />
        <span>${unitCount.toString()}</span>
        </td>`);
        trElement.insertAdjacentHTML('beforeend', `<td class="has-text-right is-nowrap">
        <input class="is-total-value-per-deal" type="hidden" value="${totalValuePerDeal.toString()}" />
        <span data-tooltip="$${valuePerDeal.toFixed(2)} value per deal">
          $ ${totalValuePerDeal}
        </span>
        </td>`);
        trElement.insertAdjacentHTML('beforeend', `<td class="has-text-right is-nowrap">
        <input class="is-total-prizes-per-deal" type="hidden" value="${totalPrizesPerDeal.toString()}" />
        <span data-tooltip="$${prizesPerDeal.toFixed(2)} prizes per deal">
          $ ${totalPrizesPerDeal}
        </span>
        </td>`);
        trElement.insertAdjacentHTML('beforeend', `<td class="has-text-right is-nowrap">
        <input class="is-licence-fee" name="ticketType_licenceFee" type="hidden" value="${licenceFee.toString()}" />
        <span>$${licenceFee.toFixed(2)}</span>
        </td>`);
        const manufacturerLocationDisplayName = manufacturerLocationsIdToNameCache.get(object.manufacturerLocationID);
        const distributorLocationDisplayName = distributorLocationsIdToNameCache.get(object.distributorLocationID);
        lastUsedDistributorID = object.distributorLocationID.toString();
        lastUsedManufacturerID = object.manufacturerLocationID.toString();
        trElement.insertAdjacentHTML('beforeend', `<td class="is-size-7">
        <input name="ticketType_manufacturerLocationID" type="hidden"
          value="${object.manufacturerLocationID.toString()}" />
        <input name="ticketType_distributorLocationID" type="hidden"
          value="${object.distributorLocationID.toString()}" />
        <span>${cityssm.escapeHTML(manufacturerLocationDisplayName)}<span><br />
        <span>${cityssm.escapeHTML(distributorLocationDisplayName)}<span></td>`);
        trElement.insertAdjacentHTML('beforeend', `<td class="is-hidden-print">
        <button class="button is-small is-danger has-tooltip-left is-delete-ticket-type-button" data-tooltip="Delete Ticket Type" type="button">
          <i class="fas fa-trash" aria-hidden="true"></i>
          <span class="sr-only">Delete</span>
        </button>
        </td>`);
        (_a = trElement
            .querySelector('.is-delete-ticket-type-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', deleteTicketTypeFunction_openConfirm);
        logTableTbodyElement.prepend(trElement);
        renderSummaryTable();
        llm.licenceEdit.setUnsavedChangesFunction();
        llm.licenceEdit.setDoRefreshAfterSaveFunction();
    }
    function deleteTicketTypeFunction_doDeleteTicketType(trElement) {
        const ticketTypeIndex = trElement.dataset.ticketTypeIndex;
        trElement.remove();
        if (!isCreate) {
            formElement.insertAdjacentHTML('beforeend', `<input class="is-removed-after-save" name="ticketTypeIndex_toDelete" type="hidden"
          value="${cityssm.escapeHTML(ticketTypeIndex)}" />`);
        }
        renderSummaryTable();
        llm.licenceEdit.setUnsavedChangesFunction();
        llm.licenceEdit.setDoRefreshAfterSaveFunction();
    }
    function deleteTicketTypeFunction_openConfirm(buttonEvent) {
        const trElement = buttonEvent.currentTarget.closest('tr');
        const ticketType = trElement.dataset.ticketType;
        cityssm.confirmModal('Delete Ticket Type?', `Are you sure you want to remove the ${ticketType} ticket type for this licence?`, 'Yes, Delete', 'danger', () => {
            deleteTicketTypeFunction_doDeleteTicketType(trElement);
        });
    }
    function addTicketType_openModal(clickEvent) {
        const ticketTypeFieldPresets = {
            manufacturerLocationId: lastUsedManufacturerID,
            distributorLocationId: lastUsedDistributorID,
            ticketType: '',
            unitCount: '1'
        };
        let deleteTicketType_trElement;
        if (clickEvent.currentTarget.id !==
            'is-add-ticket-type-button') {
            deleteTicketType_trElement = clickEvent.currentTarget.closest('tr');
            ticketTypeFieldPresets.manufacturerLocationId =
                deleteTicketType_trElement.dataset.manufacturerId;
            ticketTypeFieldPresets.distributorLocationId =
                deleteTicketType_trElement.dataset.distributorId;
            ticketTypeFieldPresets.ticketType =
                deleteTicketType_trElement.dataset.ticketType;
            ticketTypeFieldPresets.unitCount =
                deleteTicketType_trElement.dataset.unitCount;
        }
        let addTicketType_closeModalFunction;
        let addTicketType_ticketTypeElement;
        let addTicketType_unitCountElement;
        const addTicketTypeFunction_addTicketType = (formEvent) => {
            formEvent.preventDefault();
            addLogTableRow({
                ticketType: document.querySelector('#ticketTypeAdd--ticketType').value,
                unitCount: Number.parseInt(document.querySelector('#ticketTypeAdd--unitCount').value, 10),
                valuePerDeal: Number.parseFloat(document.querySelector('#ticketTypeAdd--valuePerDeal').value),
                prizesPerDeal: Number.parseFloat(document.querySelector('#ticketTypeAdd--prizesPerDeal').value),
                licenceFee: Number.parseFloat(document.querySelector('#ticketTypeAdd--licenceFee').value),
                distributorLocationID: Number.parseInt(document.querySelector('#ticketTypeAdd--distributorLocationID').value, 10),
                manufacturerLocationID: Number.parseInt(document.querySelector('#ticketTypeAdd--manufacturerLocationID').value, 10)
            });
            if (deleteTicketType_trElement) {
                deleteTicketTypeFunction_doDeleteTicketType(deleteTicketType_trElement);
            }
            addTicketType_closeModalFunction();
        };
        const addTicketTypeFunction_refreshUnitCountChange = () => {
            const unitCount = Number.parseInt(addTicketType_unitCountElement.value, 10);
            document.querySelector('#ticketTypeAdd--prizesTotal').value = (Number.parseFloat(document.querySelector('#ticketTypeAdd--prizesPerDeal').value) * unitCount).toFixed(2);
            document.querySelector('#ticketTypeAdd--licenceFee').value = (Number.parseFloat(document.querySelector('#ticketTypeAdd--feePerUnit').value) * unitCount).toFixed(2);
        };
        const addTicketTypeFunction_refreshTicketTypeChange = () => {
            const ticketTypeOptionElement = addTicketType_ticketTypeElement.selectedOptions[0];
            document.querySelector('#ticketTypeAdd--ticketPrice').value = ticketTypeOptionElement.dataset.ticketPrice;
            document.querySelector('#ticketTypeAdd--ticketCount').value = ticketTypeOptionElement.dataset.ticketCount;
            document.querySelector('#ticketTypeAdd--valuePerDeal').value = (Number.parseFloat(ticketTypeOptionElement.dataset.ticketPrice) *
                Number.parseInt(ticketTypeOptionElement.dataset.ticketCount, 10)).toFixed(2);
            document.querySelector('#ticketTypeAdd--prizesPerDeal').value = ticketTypeOptionElement.dataset.prizesPerDeal;
            document.querySelector('#ticketTypeAdd--feePerUnit').value = ticketTypeOptionElement.dataset.feePerUnit;
            addTicketTypeFunction_refreshUnitCountChange();
        };
        const addTicketTypeFunction_populateTicketTypeSelect = () => {
            loadTicketTypesCache((ticketTypes) => {
                if (!ticketTypes || ticketTypes.length === 0) {
                    addTicketType_closeModalFunction();
                    cityssm.alertModal('No ticket types available', '', 'OK', 'danger');
                    return;
                }
                addTicketType_ticketTypeElement.innerHTML = '';
                for (const ticketTypeObject of ticketTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.dataset.ticketPrice =
                        ticketTypeObject.ticketPrice.toFixed(2);
                    optionElement.dataset.ticketCount =
                        ticketTypeObject.ticketCount.toString();
                    optionElement.dataset.prizesPerDeal =
                        ticketTypeObject.prizesPerDeal.toFixed(2);
                    optionElement.dataset.feePerUnit = (ticketTypeObject.feePerUnit || 0).toFixed(2);
                    optionElement.value = ticketTypeObject.ticketType;
                    optionElement.textContent =
                        ticketTypeObject.ticketType +
                            ' (' +
                            ticketTypeObject.ticketCount.toString() +
                            ' tickets,' +
                            ' $' +
                            ticketTypeObject.ticketPrice.toFixed(2) +
                            ' each)';
                    addTicketType_ticketTypeElement.append(optionElement);
                }
                if (ticketTypeFieldPresets.ticketType !== '') {
                    addTicketType_ticketTypeElement.value =
                        ticketTypeFieldPresets.ticketType;
                }
                addTicketTypeFunction_refreshTicketTypeChange();
            });
        };
        const addTicketTypeFunction_populateDistributorSelect = () => {
            loadDistributorLocationsCache((locations) => {
                const selectElement = document.querySelector('#ticketTypeAdd--distributorLocationID');
                selectElement.innerHTML = '<option value="">(No Distributor)</option>';
                for (const location of locations) {
                    selectElement.insertAdjacentHTML('beforeend', `<option value="${cityssm.escapeHTML(location.locationID.toString())}">
              ${cityssm.escapeHTML(location.locationDisplayName)}
              </option>`);
                }
                if (ticketTypeFieldPresets.distributorLocationId !== '' &&
                    selectElement.querySelector(`[value='${lastUsedDistributorID}']`) !==
                        null) {
                    selectElement.value = ticketTypeFieldPresets.distributorLocationId;
                }
            });
        };
        const addTicketTypeFunction_populateManufacturerSelect = () => {
            loadManufacturerLocationsCache((locations) => {
                const selectElement = document.querySelector('#ticketTypeAdd--manufacturerLocationID');
                selectElement.innerHTML = '<option value="">(No Manufacturer)</option>';
                for (const location of locations) {
                    selectElement.insertAdjacentHTML('beforeend', `<option value="${cityssm.escapeHTML(location.locationID.toString())}">
              ${cityssm.escapeHTML(location.locationDisplayName)}
              </option>`);
                }
                if (ticketTypeFieldPresets.manufacturerLocationId !== '' &&
                    selectElement.querySelector(`[value='${lastUsedManufacturerID}']`) !==
                        null) {
                    selectElement.value = ticketTypeFieldPresets.manufacturerLocationId;
                }
            });
        };
        cityssm.openHtmlModal('licence-ticketTypeAdd', {
            onshow(modalElement) {
                var _a, _b;
                addTicketType_ticketTypeElement = modalElement.querySelector('#ticketTypeAdd--ticketType');
                addTicketType_unitCountElement = modalElement.querySelector('#ticketTypeAdd--unitCount');
                addTicketTypeFunction_populateDistributorSelect();
                addTicketTypeFunction_populateManufacturerSelect();
                addTicketTypeFunction_populateTicketTypeSelect();
                if (ticketTypeFieldPresets.unitCount !== '') {
                    addTicketType_unitCountElement.value =
                        ticketTypeFieldPresets.unitCount;
                    addTicketTypeFunction_refreshUnitCountChange();
                }
                if (deleteTicketType_trElement) {
                    modalElement.querySelector('.modal-card-title').textContent =
                        'Edit a Ticket Type';
                    (_a = modalElement.querySelector('.modal-card-body')) === null || _a === void 0 ? void 0 : _a.insertAdjacentHTML('afterbegin', `<div class="message is-warning">
              <p class="message-body">
                Note that editing ticket type records can negatively impact your historical reporting.
              </p>
              </div>`);
                    modalElement.querySelector(".modal-card-foot .button[type='submit']").innerHTML =
                        `<span class="icon"><i class="fas fa-save" aria-hidden="true"></i></span>
              <span>Edit Ticket Type</span>`;
                }
                addTicketType_ticketTypeElement.addEventListener('change', addTicketTypeFunction_refreshTicketTypeChange);
                addTicketType_unitCountElement.addEventListener('change', addTicketTypeFunction_refreshUnitCountChange);
                (_b = modalElement
                    .querySelector('form')) === null || _b === void 0 ? void 0 : _b.addEventListener('submit', addTicketTypeFunction_addTicketType);
            },
            onshown(_modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                addTicketType_closeModalFunction = closeModalFunction;
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    renderSummaryTable();
    (_c = document
        .querySelector('#is-add-ticket-type-button')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', addTicketType_openModal);
    const editButtonElements = ticketTypesPanelElement.querySelectorAll('.is-edit-ticket-type-button');
    for (const editButtonElement of editButtonElements) {
        editButtonElement.addEventListener('click', addTicketType_openModal);
    }
    const deleteButtonElements = ticketTypesPanelElement.querySelectorAll('.is-delete-ticket-type-button');
    for (const deleteButtonElement of deleteButtonElements) {
        deleteButtonElement.addEventListener('click', deleteTicketTypeFunction_openConfirm);
    }
}
