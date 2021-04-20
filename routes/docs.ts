import { Router } from "express";

import * as configFns from "../helpers/configFns.js";

import handler_mdFile from "../handlers/docs-get/mdFile.js";


export const router = Router();


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


router.all("/", (_req, res) => {
  res.redirect(urlPrefix + "/docs/readme.md");
});


router.all("/:mdFileName", handler_mdFile);


export default router;
