"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = (_req, res) => {
    res.render("organization-cleanup", {
        headTitle: "Organization Cleanup"
    });
};
exports.handler = handler;
