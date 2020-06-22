import type { llmGlobal } from "./types";
declare const llm: llmGlobal;


(function() {
  llm.initializeTabs(document.getElementById("tabs--reports"));
}());
