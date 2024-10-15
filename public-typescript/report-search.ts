/* eslint-disable unicorn/filename-case, @eslint-community/eslint-comments/disable-enable-pair */

import type { llmGlobal } from './types.js'

declare const llm: llmGlobal
;(() => {
  llm.initializeTabs(document.querySelector('#tabs--reports') as HTMLElement)
})()
