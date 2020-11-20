"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = (_req, res) => {
    res.render("location-cleanup", {
        headTitle: "Location Cleanup"
    });
};
exports.handler = handler;
