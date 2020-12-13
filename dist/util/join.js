"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ps = require("ps-list");
async function join(processName) {
    for (;;) {
        const processes = await ps();
        const target = processes.find((p) => p.name === processName);
        if (!target) {
            break;
        }
    }
}
exports.default = join;
