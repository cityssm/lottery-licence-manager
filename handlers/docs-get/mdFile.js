import * as configFunctions from "../../helpers/functions.config.js";
import createError from "http-errors";
import * as fs from "fs";
import path from "path";
import marked from "marked";
import sanitizeFilename from "sanitize-filename";
const __dirname = ".";
const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");
const applicationName = configFunctions.getProperty("application.applicationName");
export const handler = (request, response, next) => {
    const mdFileName = sanitizeFilename(request.params.mdFileName);
    const mdPath = path.join(__dirname, "docs", mdFileName + (mdFileName.endsWith(".md") ? "" : ".md"));
    fs.readFile(mdPath, "utf8", (error, data) => {
        if (error) {
            next(createError(400));
            return;
        }
        response.send(`<html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Help: ${applicationName}</title>
        <link rel="icon" href="${urlPrefix}/images/favicon.png" />
        <link rel="stylesheet" href="${urlPrefix}/stylesheets/docs.min.css" />
      </head>
      <body>
      <article class="markdown-body">` +
            marked(data.toString()) +
            `
      </article>
      </body>
      </html>`);
    });
};
export default handler;
