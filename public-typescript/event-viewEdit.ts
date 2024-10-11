/* eslint-disable unicorn/filename-case, @eslint-community/eslint-comments/disable-enable-pair */

;(() => {
  // Switch dates nav

  const eventDateSelectElement = document.querySelector(
    '#eventNav--eventDate'
  ) as HTMLSelectElement | null

  if (eventDateSelectElement !== null) {
    eventDateSelectElement.addEventListener('change', () => {
      const urlPrefix = document.querySelector('main')?.dataset.urlPrefix

      const licenceID = eventDateSelectElement.dataset.licenceId

      const newEventDate = eventDateSelectElement.value

      const isEdit = eventDateSelectElement.dataset.isEdit === 'true'

      globalThis.location.href = `${urlPrefix}/events/${licenceID}/${newEventDate}${isEdit ? '/edit' : ''}`
    })
  }
})()
