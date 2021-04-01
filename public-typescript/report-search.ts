import type { llmGlobal } from "./types";
declare const llm: llmGlobal;


(() => {
  llm.initializeTabs(document.getElementById("tabs--reports"));
})();
