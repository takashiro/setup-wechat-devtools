"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const Installer_1 = require("./base/Installer");
(async function main() {
    try {
        const setup = new Installer_1.default();
        core.info('Downloading WeChat DevTools...');
        await setup.download();
        core.info('Installing...');
        await setup.install();
    }
    catch (error) {
        core.setFailed(error);
    }
}());
