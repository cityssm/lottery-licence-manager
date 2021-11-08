import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "../types";

import type * as configTypes from "../../types/configTypes";
import type * as recordTypes from "../../types/recordTypes";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


if (document.querySelector("#is-ticket-types-panel")) {

  const urlPrefix = document.querySelector("main").dataset.urlPrefix;

  const formElement = document.querySelector("#form--licence") as HTMLFormElement;
  const licenceID = (document.querySelector("#licence--licenceID") as HTMLInputElement).value;
  const isCreate = licenceID === "";

  const ticketTypesPanelElement = document.querySelector("#is-ticket-types-panel");

  const licenceType_selectElement = document.querySelector("#licence--licenceTypeKey") as HTMLSelectElement;


  /*
   * Caches
   */

  const cache_licenceTypeKeyToTicketTypes: Map<string, configTypes.ConfigTicketType[]> = new Map();

  const cacheFunction_loadTicketTypes = (callbackFunction: (ticketTypes: configTypes.ConfigTicketType[]) => void) => {

    const licenceTypeKey = licenceType_selectElement.value;

    if (cache_licenceTypeKeyToTicketTypes.has(licenceTypeKey)) {

      callbackFunction(cache_licenceTypeKeyToTicketTypes.get(licenceTypeKey));

    } else {

      cityssm.postJSON(urlPrefix + "/licences/doGetTicketTypes", {
        licenceTypeKey
      },
        (ticketTypes: configTypes.ConfigTicketType[]) => {

          cache_licenceTypeKeyToTicketTypes.set(licenceTypeKey, ticketTypes);
          callbackFunction(ticketTypes);
        }
      );
    }
  };

  const cache_distributorLocations: recordTypes.Location[] = [];
  let cache_distributorLocations_idToName: Map<number, string>;

  const cache_manufacturerLocations: recordTypes.Location[] = [];
  let cache_manufacturerLocations_idToName: Map<number, string>;

  const cacheFunction_loadDistributorLocations = (callbackFunction: (locationList: recordTypes.Location[]) => void) => {

    if (cache_distributorLocations.length === 0) {

      llm.licenceEdit.loadLocationListFunction((locationList) => {

        cache_distributorLocations_idToName = new Map<number, string>();

        for (const location of locationList) {
          if (location.locationIsDistributor) {
            cache_distributorLocations.push(location);
            cache_distributorLocations_idToName.set(location.locationID, location.locationDisplayName);
          }
        }

        callbackFunction(cache_distributorLocations);
      });

    } else {
      callbackFunction(cache_distributorLocations);
    }
  };

  const cacheFunction_loadManufacturerLocations = (callbackFunction: (locationList: recordTypes.Location[]) => void) => {

    if (cache_manufacturerLocations.length === 0) {

      llm.licenceEdit.loadLocationListFunction((locationList: recordTypes.Location[]) => {

        cache_manufacturerLocations_idToName = new Map<number, string>();

        for (const location of locationList) {
          if (location.locationIsManufacturer) {
            cache_manufacturerLocations.push(location);
            cache_manufacturerLocations_idToName.set(location.locationID, location.locationDisplayName);
          }
        }

        callbackFunction(cache_manufacturerLocations);
      });

    } else {
      callbackFunction(cache_manufacturerLocations);
    }
  };

  /*
   * Tables
   */

  const summaryTableElement = document.querySelector("#ticketTypesTabPanel--summary");
  const summaryTableTbodyElement = summaryTableElement.querySelector("tbody");
  const summaryTableTFootElement = summaryTableElement.querySelector("tfoot");

  const logTableElement = document.querySelector("#ticketTypesTabPanel--log");
  const logTableTbodyElement = logTableElement.querySelector("tbody");
  const logTableTFootElement = logTableElement.querySelector("tfoot");

  let lastUsedDistributorID = "";
  let lastUsedManufacturerID = "";

  if (logTableTbodyElement.querySelectorAll("tr").length > 0) {

    const trElements = logTableTbodyElement.querySelectorAll("tr");
    const lastTrElement = trElements[trElements.length - 1];

    lastUsedDistributorID = lastTrElement.dataset.distributorId;
    lastUsedManufacturerID = lastTrElement.dataset.manufacturerId;
  }

  const summaryTableFunction_renderTable = () => {

    // sum up the log rows

    const ticketTypeTotals = new Map<string, {
      totalUnits: number;
      totalValue: number;
      totalPrizes: number;
      totalLicenceFee: number;
    }>();

    const logTrElements = logTableTbodyElement.querySelectorAll("tr");

    for (const logTrElement of logTrElements) {

      const ticketType = logTrElement.getAttribute("data-ticket-type");

      let totalUnits = Number.parseInt(logTrElement.getAttribute("data-unit-count"), 10);
      let totalValue = Number.parseFloat(logTrElement.getAttribute("data-total-value"));
      let totalPrizes = Number.parseFloat(logTrElement.getAttribute("data-total-prizes"));
      let totalLicenceFee = Number.parseFloat(logTrElement.getAttribute("data-licence-fee"));

      if (ticketTypeTotals.has(ticketType)) {
        totalUnits += ticketTypeTotals.get(ticketType).totalUnits;
        totalValue += ticketTypeTotals.get(ticketType).totalValue;
        totalPrizes += ticketTypeTotals.get(ticketType).totalPrizes;
        totalLicenceFee += ticketTypeTotals.get(ticketType).totalLicenceFee;
      }

      ticketTypeTotals.set(ticketType, {
        totalUnits,
        totalValue,
        totalPrizes,
        totalLicenceFee
      });
    }

    // sort ticket types

    const ticketTypes: string[] = [];

    for (const ticketType of ticketTypeTotals.keys()) {
      ticketTypes.push(ticketType);
    }

    ticketTypes.sort();

    // update summary table body

    cityssm.clearElement(summaryTableTbodyElement);

    const grandTotals = {
      totalUnits: 0,
      totalValue: 0,
      totalPrizes: 0,
      totalLicenceFee: 0
    };

    for (const ticketType of ticketTypes) {

      const rowTotals = ticketTypeTotals.get(ticketType);

      grandTotals.totalUnits += rowTotals.totalUnits;
      grandTotals.totalValue += rowTotals.totalValue;
      grandTotals.totalPrizes += rowTotals.totalPrizes;
      grandTotals.totalLicenceFee += rowTotals.totalLicenceFee;

      const summaryTrElement = document.createElement("tr");

      summaryTrElement.innerHTML = ("<td>" + ticketType + "</td>") +
        ("<td class=\"has-text-right\">" + rowTotals.totalUnits.toString() + "</td>") +
        ("<td class=\"has-text-right\">" + llm.formatDollarsAsHTML(rowTotals.totalValue) + "</td>") +
        ("<td class=\"has-text-right\">" + llm.formatDollarsAsHTML(rowTotals.totalPrizes) + "</td>") +
        ("<td class=\"has-text-right\">" + llm.formatDollarsAsHTML(rowTotals.totalLicenceFee) + "</td>");

      summaryTableTbodyElement.append(summaryTrElement);
    }

    // update summary table footer

    summaryTableTFootElement.innerHTML = "<td></td>" +
      "<th class=\"has-text-right\">" + grandTotals.totalUnits.toString() + "</th>" +
      "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalValue) + "</th>" +
      "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalPrizes) + "</th>" +
      "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalLicenceFee) + "</th>";

    // update log table footer

    logTableTFootElement.innerHTML = "<td></td>" +
      "<td></td>" +
      "<th class=\"has-text-right\">" + grandTotals.totalUnits.toString() + "</th>" +
      "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalValue) + "</th>" +
      "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalPrizes) + "</th>" +
      "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalLicenceFee) + "</th>" +
      "<td></td>" +
      "<td class=\"is-hidden-print\"></td>";

    // update total prize value

    (document.querySelector("#licence--totalPrizeValue") as HTMLInputElement).value = grandTotals.totalPrizes.toFixed(2);
  };

  const logTableFunction_addTr = (object: {
    ticketType: string;
    unitCount: number;
    licenceFee: number;
    prizesPerDeal: number;
    valuePerDeal: number;
    distributorLocationID: number;
    manufacturerLocationID: number;
  }) => {

    /*
     * Calculate values
     */

    const ticketType = object.ticketType;

    const unitCount = object.unitCount;

    const valuePerDeal = object.valuePerDeal;
    const totalValuePerDeal = (valuePerDeal * unitCount).toFixed(2);

    const prizesPerDeal = object.prizesPerDeal;
    const totalPrizesPerDeal = (prizesPerDeal * unitCount).toFixed(2);

    const licenceFee = object.licenceFee;

    /*
     * Build row
     */

    const trElement = document.createElement("tr");

    trElement.className = "has-background-success-light";

    trElement.dataset.ticketTypeIndex = "";
    trElement.dataset.ticketType = ticketType;
    trElement.dataset.unitCount = unitCount.toString();
    trElement.dataset.totalValue = totalValuePerDeal.toString();
    trElement.dataset.totalPrizes = totalPrizesPerDeal.toString();
    trElement.dataset.licenceFee = object.licenceFee.toString();

    trElement.insertAdjacentHTML("beforeend", "<td>" +
      "<input name=\"ticketType_ticketTypeIndex\" type=\"hidden\" value=\"\" />" +
      "<input name=\"ticketType_amendmentDate\" type=\"hidden\" value=\"\" />" +
      "<span>(New Record)</span>" +
      "</td>");

    trElement.insertAdjacentHTML("beforeend", "<td>" +
      "<input name=\"ticketType_ticketType\" type=\"hidden\" value=\"" + cityssm.escapeHTML(ticketType) + "\" />" +
      "<span>" + cityssm.escapeHTML(ticketType) + "</span>" +
      "</td>");

    // Unit count

    trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
      "<input name=\"ticketType_unitCount\" type=\"hidden\" value=\"" + unitCount.toString() + "\" />" +
      "<span>" + unitCount.toString() + "</span>" +
      "</td>");

    // Value per deal

    trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
      "<input class=\"is-total-value-per-deal\" type=\"hidden\" value=\"" + totalValuePerDeal.toString() + "\" />" +
      "<span data-tooltip=\"$" + valuePerDeal.toFixed(2) + " value per deal\">$ " + totalValuePerDeal + "</span>" +
      "</td>");

    // Prizes per deal

    trElement.insertAdjacentHTML("beforeend",
      "<td class=\"has-text-right is-nowrap\">" +
      "<input class=\"is-total-prizes-per-deal\" type=\"hidden\" value=\"" + totalPrizesPerDeal.toString() + "\" />" +
      "<span data-tooltip=\"$" + prizesPerDeal.toFixed(2) + " prizes per deal\">" +
      "$" + totalPrizesPerDeal +
      "</span>" +
      "</td>");

    // Licence fee

    trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
      "<input class=\"is-licence-fee\" name=\"ticketType_licenceFee\"" +
      " type=\"hidden\" value=\"" + licenceFee.toString() + "\" />" +
      "<span>$" + licenceFee.toFixed(2) + "</span>" +
      "</td>");

    // Manufacturer / Distributor

    const manufacturerLocationDisplayName = cache_manufacturerLocations_idToName.get(object.manufacturerLocationID);
    const distributorLocationDisplayName = cache_distributorLocations_idToName.get(object.distributorLocationID);

    lastUsedDistributorID = object.distributorLocationID.toString();
    lastUsedManufacturerID = object.manufacturerLocationID.toString();

    trElement.insertAdjacentHTML("beforeend", "<td class=\"is-size-7\">" +
      "<input name=\"ticketType_manufacturerLocationID\" type=\"hidden\" value=\"" + object.manufacturerLocationID.toString() + "\" />" +
      "<input name=\"ticketType_distributorLocationID\" type=\"hidden\" value=\"" + object.distributorLocationID.toString() + "\" />" +
      "<span>" + cityssm.escapeHTML(manufacturerLocationDisplayName) + "<span><br />" +
      "<span>" + cityssm.escapeHTML(distributorLocationDisplayName) + "<span>" +
      "</td>");

    // Delete

    trElement.insertAdjacentHTML("beforeend", "<td class=\"is-hidden-print\">" +
      "<button class=\"button is-small is-danger has-tooltip-left is-delete-ticket-type-button\"" +
      " data-tooltip=\"Delete Ticket Type\" type=\"button\">" +
      "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
      "<span class=\"sr-only\">Delete</span>" +
      "</button>" +
      "</td>");

    trElement.querySelector(".is-delete-ticket-type-button")
      .addEventListener("click", deleteTicketTypeFunction_openConfirm);

    // Insert row

    logTableTbodyElement.prepend(trElement);

    summaryTableFunction_renderTable();

    llm.licenceEdit.setUnsavedChangesFunction();
    llm.licenceEdit.setDoRefreshAfterSaveFunction();
  };

  const deleteTicketTypeFunction_doDeleteTicketType = (trElement: HTMLTableRowElement) => {

    const ticketTypeIndex = trElement.dataset.ticketTypeIndex;

    trElement.remove();

    if (!isCreate) {

      formElement.insertAdjacentHTML(
        "beforeend",
        "<input class=\"is-removed-after-save\" name=\"ticketTypeIndex_toDelete\"" +
        " type=\"hidden\" value=\"" + cityssm.escapeHTML(ticketTypeIndex) + "\" />"
      );
    }

    summaryTableFunction_renderTable();

    llm.licenceEdit.setUnsavedChangesFunction();
    llm.licenceEdit.setDoRefreshAfterSaveFunction();
  };

  const deleteTicketTypeFunction_openConfirm = (buttonEvent: Event) => {

    const trElement = (buttonEvent.currentTarget as HTMLButtonElement).closest("tr");

    const ticketType = trElement.dataset.ticketType;

    cityssm.confirmModal(
      "Delete Ticket Type?",
      "Are you sure you want to remove the " + ticketType + " ticket type for this licence?",
      "Yes, Delete",
      "danger",
      () => {
        deleteTicketTypeFunction_doDeleteTicketType(trElement);
      }
    );
  };

  const addTicketType_openModal = (clickEvent: Event) => {

    const ticketTypeFieldPresets = {
      manufacturerLocationId: lastUsedManufacturerID,
      distributorLocationId: lastUsedDistributorID,
      ticketType: "",
      unitCount: "1"
    };

    let deleteTicketType_trElement: HTMLTableRowElement;

    if ((clickEvent.currentTarget as HTMLButtonElement).id !== "is-add-ticket-type-button") {

      deleteTicketType_trElement = (clickEvent.currentTarget as HTMLButtonElement).closest("tr");

      ticketTypeFieldPresets.manufacturerLocationId = deleteTicketType_trElement.dataset.manufacturerId;
      ticketTypeFieldPresets.distributorLocationId = deleteTicketType_trElement.dataset.distributorId;
      ticketTypeFieldPresets.ticketType = deleteTicketType_trElement.dataset.ticketType;
      ticketTypeFieldPresets.unitCount = deleteTicketType_trElement.dataset.unitCount;
    }

    let addTicketType_closeModalFunction: () => void;
    let addTicketType_ticketTypeElement: HTMLSelectElement;
    let addTicketType_unitCountElement: HTMLInputElement;

    const addTicketTypeFunction_addTicketType = (formEvent: Event) => {

      formEvent.preventDefault();

      logTableFunction_addTr({
        ticketType: (document.querySelector("#ticketTypeAdd--ticketType") as HTMLInputElement).value,
        unitCount: Number.parseInt((document.querySelector("#ticketTypeAdd--unitCount") as HTMLInputElement).value, 10),
        valuePerDeal: Number.parseFloat((document.querySelector("#ticketTypeAdd--valuePerDeal") as HTMLInputElement).value),
        prizesPerDeal: Number.parseFloat((document.querySelector("#ticketTypeAdd--prizesPerDeal") as HTMLInputElement).value),
        licenceFee: Number.parseFloat((document.querySelector("#ticketTypeAdd--licenceFee") as HTMLInputElement).value),
        distributorLocationID: Number.parseInt((document.querySelector("#ticketTypeAdd--distributorLocationID") as HTMLSelectElement).value, 10),
        manufacturerLocationID: Number.parseInt((document.querySelector("#ticketTypeAdd--manufacturerLocationID") as HTMLSelectElement).value, 10)
      });

      if (deleteTicketType_trElement) {
        deleteTicketTypeFunction_doDeleteTicketType(deleteTicketType_trElement);
      }

      addTicketType_closeModalFunction();
    };

    const addTicketTypeFunction_refreshUnitCountChange = () => {

      const unitCount = Number.parseInt(addTicketType_unitCountElement.value, 10);

      (document.querySelector("#ticketTypeAdd--prizesTotal") as HTMLInputElement).value =
        (Number.parseFloat((document.querySelector("#ticketTypeAdd--prizesPerDeal") as HTMLInputElement).value) * unitCount)
          .toFixed(2);

      (document.querySelector("#ticketTypeAdd--licenceFee") as HTMLInputElement).value =
        (Number.parseFloat((document.querySelector("#ticketTypeAdd--feePerUnit") as HTMLInputElement).value) * unitCount)
          .toFixed(2);
    };

    const addTicketTypeFunction_refreshTicketTypeChange = () => {

      const ticketTypeOptionElement = addTicketType_ticketTypeElement.selectedOptions[0];

      (document.querySelector("#ticketTypeAdd--ticketPrice") as HTMLInputElement).value =
        ticketTypeOptionElement.getAttribute("data-ticket-price");

      (document.querySelector("#ticketTypeAdd--ticketCount") as HTMLInputElement).value =
        ticketTypeOptionElement.getAttribute("data-ticket-count");

      (document.querySelector("#ticketTypeAdd--valuePerDeal") as HTMLInputElement).value =
        (Number.parseFloat(ticketTypeOptionElement.getAttribute("data-ticket-price")) *
          Number.parseInt(ticketTypeOptionElement.getAttribute("data-ticket-count"), 10))
          .toFixed(2);

      (document.querySelector("#ticketTypeAdd--prizesPerDeal") as HTMLInputElement).value =
        ticketTypeOptionElement.getAttribute("data-prizes-per-deal");

      (document.querySelector("#ticketTypeAdd--feePerUnit") as HTMLInputElement).value =
        ticketTypeOptionElement.getAttribute("data-fee-per-unit");

      addTicketTypeFunction_refreshUnitCountChange();
    };

    const addTicketTypeFunction_populateTicketTypeSelect = () => {

      cacheFunction_loadTicketTypes((ticketTypes) => {

        if (!ticketTypes || ticketTypes.length === 0) {

          addTicketType_closeModalFunction();
          cityssm.alertModal("No ticket types available", "", "OK", "danger");
          return;
        }

        addTicketType_ticketTypeElement.innerHTML = "";

        for (const ticketTypeObject of ticketTypes) {

          const optionElement = document.createElement("option");

          optionElement.dataset.ticketPrice = ticketTypeObject.ticketPrice.toFixed(2);
          optionElement.dataset.ticketCount = ticketTypeObject.ticketCount.toString();
          optionElement.dataset.prizesPerDeal = ticketTypeObject.prizesPerDeal.toFixed(2);
          optionElement.dataset.feePerUnit = (ticketTypeObject.feePerUnit || 0).toFixed(2);

          optionElement.value = ticketTypeObject.ticketType;

          optionElement.textContent =
            ticketTypeObject.ticketType +
            " (" + ticketTypeObject.ticketCount.toString() + " tickets," +
            " $" + ticketTypeObject.ticketPrice.toFixed(2) + " each)";

          addTicketType_ticketTypeElement.append(optionElement);
        }

        if (ticketTypeFieldPresets.ticketType !== "") {
          addTicketType_ticketTypeElement.value = ticketTypeFieldPresets.ticketType;
        }

        addTicketTypeFunction_refreshTicketTypeChange();
      });
    };

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const addTicketTypeFunction_populateDistributorSelect = () => {

      cacheFunction_loadDistributorLocations((locations) => {

        const selectElement = document.querySelector("#ticketTypeAdd--distributorLocationID") as HTMLSelectElement;

        selectElement.innerHTML = "<option value=\"\">(No Distributor)</option>";

        for (const location of locations) {
          selectElement.insertAdjacentHTML("beforeend", "<option value=\"" + location.locationID.toString() + "\">" +
            cityssm.escapeHTML(location.locationDisplayName) +
            "</option>");
        }

        if (ticketTypeFieldPresets.distributorLocationId !== "" && selectElement.querySelector("[value='" + lastUsedDistributorID + "']")) {
          selectElement.value = ticketTypeFieldPresets.distributorLocationId;
        }
      });
    };

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const addTicketTypeFunction_populateManufacturerSelect = () => {

      cacheFunction_loadManufacturerLocations((locations) => {

        const selectElement = document.querySelector("#ticketTypeAdd--manufacturerLocationID") as HTMLSelectElement;

        selectElement.innerHTML = "<option value=\"\">(No Manufacturer)</option>";

        for (const location of locations) {
          selectElement.insertAdjacentHTML("beforeend", "<option value=\"" + location.locationID.toString() + "\">" +
            cityssm.escapeHTML(location.locationDisplayName) +
            "</option>");
        }

        if (ticketTypeFieldPresets.manufacturerLocationId !== "" && selectElement.querySelector("[value='" + lastUsedManufacturerID + "']")) {
          selectElement.value = ticketTypeFieldPresets.manufacturerLocationId;
        }
      });
    };

    cityssm.openHtmlModal("licence-ticketTypeAdd", {

      onshow(modalElement) {

        addTicketType_ticketTypeElement = modalElement.querySelector("#ticketTypeAdd--ticketType") as HTMLSelectElement;
        addTicketType_unitCountElement = modalElement.querySelector("#ticketTypeAdd--unitCount") as HTMLInputElement;

        addTicketTypeFunction_populateDistributorSelect();
        addTicketTypeFunction_populateManufacturerSelect();
        addTicketTypeFunction_populateTicketTypeSelect();

        if (ticketTypeFieldPresets.unitCount !== "") {
          addTicketType_unitCountElement.value = ticketTypeFieldPresets.unitCount;
          addTicketTypeFunction_refreshUnitCountChange();
        }

        if (deleteTicketType_trElement) {
          modalElement.querySelector(".modal-card-title").textContent = "Edit a Ticket Type";

          modalElement.querySelector(".modal-card-body").insertAdjacentHTML("afterbegin", "<div class=\"message is-warning\">" +
            "<p class=\"message-body\">Note that editing ticket type records can negatively impact your historical reporting.</p>" +
            "</div>");

          modalElement.querySelector(".modal-card-foot .button[type='submit']").innerHTML =
            "<span class=\"icon\"><i class=\"fas fa-save\" aria-hidden=\"true\"></i></span>" +
            "<span>Edit Ticket Type</span>";
        }

        addTicketType_ticketTypeElement.addEventListener("change", addTicketTypeFunction_refreshTicketTypeChange);
        addTicketType_unitCountElement.addEventListener("change", addTicketTypeFunction_refreshUnitCountChange);

        modalElement.querySelector("form").addEventListener("submit", addTicketTypeFunction_addTicketType);
      },

      onshown(_modalElement, closeModalFunction) {
        addTicketType_closeModalFunction = closeModalFunction;
      }
    });
  };

  // initialize

  summaryTableFunction_renderTable();

  document.querySelector("#is-add-ticket-type-button").addEventListener("click", addTicketType_openModal);

  // edit buttons

  const editButtonElements = ticketTypesPanelElement.querySelectorAll(".is-edit-ticket-type-button");

  for (const editButtonElement of editButtonElements) {
    editButtonElement.addEventListener("click", addTicketType_openModal);
  }

  // delete buttons

  const deleteButtonElements = ticketTypesPanelElement.querySelectorAll(".is-delete-ticket-type-button");

  for (const deleteButtonElement of deleteButtonElements) {
    deleteButtonElement.addEventListener("click", deleteTicketTypeFunction_openConfirm);
  }
}
