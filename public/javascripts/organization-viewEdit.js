"use strict";

(function() {

  /*
   * Licences
   */

  llm.initializeTabs(document.getElementById("tabs--licences"));

  /*
   * Remarks
   */

  const remarksContainerEle = document.getElementById("container--remarks");

  // Update remarks

  if (document.getElementsByTagName("main")[0].getAttribute("data-can-create") === "true") {

    const organizationID = remarksContainerEle.getAttribute("data-organization-id");

    let refreshRemarksFn;

    const editRemarkFn = function(buttonEvent) {

      const remarkIndex = buttonEvent.currentTarget.getAttribute("data-remark-index");
      llm.organizationRemarks.openEditRemarkModal(organizationID, remarkIndex, refreshRemarksFn);

    };

    const deleteRemarkFn = function(buttonEvent) {

      const remarkIndex = buttonEvent.currentTarget.getAttribute("data-remark-index");
      llm.organizationRemarks.deleteRemark(organizationID, remarkIndex, true, refreshRemarksFn);

    };

    refreshRemarksFn = function() {

      llm.organizationRemarks.getRemarksByOrganizationID(organizationID, function(remarkList) {

        llm.clearElement(remarksContainerEle);

        if (remarkList.length === 0) {

          remarksContainerEle.innerHTML = "<div class=\"panel-block\">" +
            "<div class=\"message is-info\">" +
            "<p class=\"message-body\">There are no remarks associated with this organization.</p>" +
            "</div>" +
            "</div>";

        } else {

          for (let remarkIndex = 0; remarkIndex < remarkList.length; remarkIndex += 1) {

            const remark = remarkList[remarkIndex];

            remarksContainerEle.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
              "<div class=\"columns is-mobile\">" +
              "<div class=\"column is-narrow\">" +
              (remark.isImportant ?
                "<i class=\"fas fa-fw fa-star\" aria-hidden=\"true\"></i>" :
                "<i class=\"far fa-fw fa-comment\" aria-hidden=\"true\"></i>") +
              "</div>" +
              "<div class=\"column\">" +
              "<p class=\"has-newline-chars\">" + llm.escapeHTML(remark.remark) + "</p>" +
              "<p class=\"is-size-7\">" +
              remark.recordUpdate_userName + " - " + remark.remarkDateString + " " + remark.remarkTimeString +
              "</p>" +
              "</div>" +
              (remark.canUpdate ?
                "<div class=\"column is-narrow\">" +
                "<div class=\"buttons is-right has-addons\">" +
                "<button class=\"button is-small is-edit-remark-button\" data-remark-index=\"" + remark.remarkIndex + "\" type=\"button\">" +
                "<span class=\"icon is-small\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                "<span>Edit</span>" +
                "</button>" +
                "<button class=\"button is-small has-text-danger is-delete-remark-button\" data-remark-index=\"" + remark.remarkIndex + "\" type=\"button\">" +
                "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
                "<span class=\"sr-only\">Delete</span>" +
                "</button>" +
                "</div>" +
                "</div>" :
                "") +
              "</div>" +
              "</div>");

          }

          const editBtnEles = remarksContainerEle.getElementsByClassName("is-edit-remark-button");

          for (let btnIndex = 0; btnIndex < editBtnEles.length; btnIndex += 1) {

            editBtnEles[btnIndex].addEventListener("click", editRemarkFn);

          }

          const deleteBtnEles = remarksContainerEle.getElementsByClassName("is-delete-remark-button");

          for (let btnIndex = 0; btnIndex < deleteBtnEles.length; btnIndex += 1) {

            deleteBtnEles[btnIndex].addEventListener("click", deleteRemarkFn);

          }

        }

      });

    };

    document.getElementsByClassName("is-add-remark-button")[0].addEventListener("click", function(clickEvent) {

      clickEvent.preventDefault();
      llm.organizationRemarks.openAddRemarkModal(organizationID, refreshRemarksFn);

    });

    const editBtnEles = remarksContainerEle.getElementsByClassName("is-edit-remark-button");

    for (let btnIndex = 0; btnIndex < editBtnEles.length; btnIndex += 1) {

      editBtnEles[btnIndex].addEventListener("click", editRemarkFn);

    }

    const deleteBtnEles = remarksContainerEle.getElementsByClassName("is-delete-remark-button");

    for (let btnIndex = 0; btnIndex < deleteBtnEles.length; btnIndex += 1) {

      deleteBtnEles[btnIndex].addEventListener("click", deleteRemarkFn);

    }

  }

  // Filter remarks

  const remarkSearchStrEle = document.getElementById("remark--searchStr");

  if (remarkSearchStrEle) {

    remarkSearchStrEle.value = "";

    const remarkDisplayCountEle = document.getElementById("remark--displayCount");
    const remarkBlockEles = remarksContainerEle.getElementsByClassName("is-remark-block");

    remarkSearchStrEle.addEventListener("keyup", function(keyupEvent) {

      const searchStrSplit = keyupEvent.currentTarget.value
        .trim()
        .toLowerCase()
        .split(" ");

      let displayCount = remarkBlockEles.length;

      for (let remarkBlockIndex = 0; remarkBlockIndex < remarkBlockEles.length; remarkBlockIndex += 1) {

        const remark = remarkBlockEles[remarkBlockIndex].getElementsByClassName("is-remark")[0].innerText
          .trim()
          .toLowerCase();

        let showRemark = true;

        for (let searchStrIndex = 0; searchStrIndex < searchStrSplit.length; searchStrIndex += 1) {

          if (remark.indexOf(searchStrSplit[searchStrIndex]) === -1) {

            showRemark = false;
            displayCount -= 1;

            break;

          }

        }

        if (showRemark) {

          remarkBlockEles[remarkBlockIndex].classList.remove("is-hidden");

        } else {

          remarkBlockEles[remarkBlockIndex].classList.add("is-hidden");

        }

      }

      remarkDisplayCountEle.innerText = displayCount;

    });

  }


}());
