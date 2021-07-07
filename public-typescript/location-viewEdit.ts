/* eslint-disable unicorn/filename-case */

import type { llmGlobal } from "./types";

declare const llm: llmGlobal;


(() => {
  // Licences
  llm.initializeTabs(document.querySelector("#tabs--licences"));
})();
