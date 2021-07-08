/* eslint-disable unicorn/filename-case */

import type { llmGlobal } from "./types";
declare const llm: llmGlobal;


(() => {
  llm.initializeTabs(document.querySelector("#tabs--reports"));
})();
