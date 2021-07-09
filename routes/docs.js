import { Router } from "express";
import * as configFunctions from "../helpers/functions.config.js";
import handler_mdFile from "../handlers/docs-get/mdFile.js";
export const router = Router();
const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");
router.all("/", (_request, response) => {
    response.redirect(urlPrefix + "/docs/readme.md");
});
router.all("/:mdFileName", handler_mdFile);
export default router;
