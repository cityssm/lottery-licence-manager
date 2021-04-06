"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = (_req, res) => {
    res.render("event-outstanding", {
        headTitle: "Outstanding Events"
    });
};
exports.handler = handler;
