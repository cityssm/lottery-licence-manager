/* eslint-disable unicorn/filename-case, @eslint-community/eslint-comments/disable-enable-pair */

import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types'

import type { DoSaveApplicationSettingResponse } from '../handlers/admin-post/doSaveApplicationSetting.js'

declare const cityssm: cityssmGlobal
;(() => {
  const urlPrefix = (document.querySelector('main') as HTMLElement).dataset
    .urlPrefix

  function getMessageElement(
    formElement: HTMLFormElement | HTMLInputElement
  ): HTMLElement {
    return formElement
      .closest('tr')
      ?.querySelectorAll('.formMessage')
      .item(0) as HTMLElement
  }

  /*
   * Form
   */

  function submitFunction(formEvent: Event): void {
    formEvent.preventDefault()

    const formElement = formEvent.currentTarget as HTMLFormElement
    const messageElement = getMessageElement(formElement)

    messageElement.innerHTML =
      'Saving... <i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i>'

    cityssm.postJSON(
      `${urlPrefix}/admin/doSaveApplicationSetting`,
      formElement,
      (rawResponseJSON) => {
        const responseJSON =
          rawResponseJSON as unknown as DoSaveApplicationSettingResponse

        // eslint-disable-next-line no-unsanitized/property
        messageElement.innerHTML = responseJSON.success
          ? '<span class="has-text-success">Updated Successfully</span>'
          : '<span class="has-text-danger">Update Error</span>'
      }
    )
  }

  function changeFunction(inputEvent: Event): void {
    getMessageElement(inputEvent.currentTarget as HTMLInputElement).innerHTML =
      '<span class="has-text-info">Unsaved Changes</span>'
  }

  const formElements = document.querySelectorAll(
    '.form--applicationSetting'
  ) as NodeListOf<HTMLFormElement>

  for (const formElement of formElements) {
    formElement.addEventListener('submit', submitFunction)
    formElement
      .querySelectorAll('.input')
      .item(0)
      .addEventListener('change', changeFunction)
  }
})()
