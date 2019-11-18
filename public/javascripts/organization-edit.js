/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  const formEle = document.getElementById("form--organization");
  const formMessageEle = document.getElementById("container--form-message");
  const isCreate = document.getElementById("organization--organizationID").value === "";
  const organizationID = document.getElementById("organization--organizationID").value;

  // Main record update

  function doOrganizationSave(formEvent) {
    formEvent.preventDefault();

    window.fetch("/organizations/doSave", {
        method: "post",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEle))
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(responseJSON) {

        window.llm.disableNavBlocker();

        if (responseJSON.success && isCreate) {
          window.location.href = "/organizations/" + responseJSON.organizationID + "/edit";
        } else {
          formMessageEle.innerHTML = "<div class=\"is-size-7 " + (responseJSON.success ? "has-text-success" : "has-text-danger") + "\">" +
            responseJSON.message +
            "</div>";
        }
      });
  }

  formEle.addEventListener("submit", doOrganizationSave);

  if (!isCreate) {

    /*
     * Representatives
     */

    const representativeTbodyEle = document.getElementsByClassName("is-representative-table")[0].getElementsByTagName("tbody")[0];

    const showNoRepresentativesWarning = function() {
      if (representativeTbodyEle.getElementsByTagName("tr").length === 0) {

        representativeTbodyEle.innerHTML = "<tr class=\"has-background-warning is-empty-warning\">" +
          "<td class=\"has-text-centered\" colspan=\"6\"><strong>There are no representatives associated with this organization.</strong></td>" +
          "</tr>";
      }
    };

    showNoRepresentativesWarning();

    // Default toggle

    const updateDefaultRepresentative = function(changeEvent) {

      const defaultRepresentativeIndex = changeEvent.currentTarget.value;

      window.fetch("/organizations/" + organizationID + "/doSetDefaultRepresentative", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            isDefaultRepresentativeIndex: defaultRepresentativeIndex
          })
        })
        .then(function(response) {
          return response.json();
        });
    };

    const radioEles = representativeTbodyEle.getElementsByTagName("input");

    for (let radioIndex = 0; radioIndex < radioEles.length; radioIndex += 1) {
      radioEles[radioIndex].addEventListener("change", updateDefaultRepresentative);
    }

    // Add

    const addRepresentativeModalEle = document.getElementsByClassName("is-add-representative-modal")[0];
    const addRepresentativeFormEle = addRepresentativeModalEle.getElementsByTagName("form")[0];

    // open add
    document.getElementsByClassName("is-add-representative-button")[0].addEventListener("click", function() {
      addRepresentativeFormEle.reset();
      window.llm.showModal(addRepresentativeModalEle);
    });

    // close add
    const cancelButtonEles = addRepresentativeModalEle.getElementsByClassName("is-cancel-button");

    for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
      cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
    }

    addRepresentativeFormEle.addEventListener("submit", function(formEvent) {
      formEvent.preventDefault();

      window.fetch("/organizations/" + organizationID + "/doAddOrganizationRepresentative", {
          method: "POST",
          credentials: "include",
          body: new URLSearchParams(new FormData(formEvent.currentTarget))
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(responseJSON) {

          if (responseJSON.success) {

            // remove empty warning

            let emptyWarningEle = representativeTbodyEle.getElementsByClassName("is-empty-warning");
            if (emptyWarningEle.length > 0) {
              emptyWarningEle[0].remove();
            }

            // create row

            const representativeObj = responseJSON.organizationRepresentative;

            const trEle = document.createElement("tr");

            trEle.setAttribute("data-representative-index", representativeObj.RepresentativeIndex);
            trEle.setAttribute("data-representative-name", representativeObj.RepresentativeName);
            trEle.setAttribute("data-representative-title", representativeObj.RepresentativeTitle);
            trEle.setAttribute("data-representative-address-1", representativeObj.RepresentativeAddress1);
            trEle.setAttribute("data-representative-address-2", representativeObj.RepresentativeAddress2);
            trEle.setAttribute("data-representative-city", representativeObj.RepresentativeCity);
            trEle.setAttribute("data-representative-province", representativeObj.RepresentativeProvince);
            trEle.setAttribute("data-representative-postal-code", representativeObj.RepresentativePostalCode);

            trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
              "<div class=\"field\">" +
              "<input class=\"is-checkradio is-info\" id=\"representative-isDefault--" + representativeObj.RepresentativeIndex + "\" name=\"representative-isDefault\" type=\"radio\"" + (representativeObj.IsDefault ? " checked" : "") + " />&nbsp;" +
              "<label for=\"representative-isDefault--" + representativeObj.RepresentativeIndex + "\"></label>" +
              "</div>" +
              "</td>");

            trEle.getElementsByTagName("input")[0].addEventListener("change", updateDefaultRepresentative);

            let tdEle = document.createElement("td");
            tdEle.innerHTML = representativeObj.RepresentativeName + "<br />" + representativeObj.RepresentativeTitle;
            trEle.insertAdjacentElement("beforeend", tdEle);

            tdEle = document.createElement("td");
            tdEle.innerHTML = representativeObj.RepresentativeAddress1 + "<br />" + representativeObj.RepresentativeAddress2;
            trEle.insertAdjacentElement("beforeend", tdEle);

            tdEle = document.createElement("td");
            tdEle.innerHTML = representativeObj.RepresentativeCity + ", " + representativeObj.RepresentativeProvince;
            trEle.insertAdjacentElement("beforeend", tdEle);

            tdEle = document.createElement("td");
            tdEle.innerHTML = representativeObj.RepresentativePostalCode;
            trEle.insertAdjacentElement("beforeend", tdEle);

            trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
              "<a class=\"is-edit-representative-button\" href=\"#\"><i class=\"fas fa-pencil-alt\"></i></a>" +
              "</td>");

            representativeTbodyEle.insertAdjacentElement("beforeend", trEle);

            window.llm.hideModal(addRepresentativeModalEle);
          }
        });
    });
  }

  // Nav blocker

  function setUnsavedChanges() {
    window.llm.enableNavBlocker();
    formMessageEle.innerHTML = "<div class=\"is-size-7 has-text-info\">" +
      "<i class=\"fas fa-exclamation-triangle\"></i> Unsaved Changes" +
      "</div>";
  }

  const inputEles = formEle.getElementsByClassName("input");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
    inputEles[inputIndex].addEventListener("change", setUnsavedChanges);
  }
}());
