import type { llmGlobal } from "./types";

declare const llm: llmGlobal;


(() => {

  // Licences
  llm.initializeTabs(document.getElementById("tabs--licences"));

})();
