"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
const express_1 = require("express");
const router = express_1.Router();
const createError = __importStar(require("http-errors"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const marked = __importStar(require("marked"));
const configFns = __importStar(require("../helpers/configFns"));
router.all("/", function (_req, res) {
    res.redirect("/docs/readme.md");
});
router.all("/:mdFileName", function (req, res, next) {
    const mdFileName = req.params.mdFileName;
    const mdPath = path.join(__dirname, "..", "docs", mdFileName + (mdFileName.endsWith(".md") ? "" : ".md"));
    fs.readFile(mdPath, "utf8", function (err, data) {
        if (err) {
            next(createError(400));
            return;
        }
        const applicationName = configFns.getProperty("application.applicationName");
        res.send(`<html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Help: ${applicationName}</title>
        <link rel="icon" href="/images/favicon.png" />
        <link rel="stylesheet" href="/stylesheets/docs.min.css" />
      </head>
      <body>
      <article class="markdown-body">` +
            marked(data.toString()) +
            `
      </article>
      </body>
      </html>`);
    });
});
module.exports = router;
