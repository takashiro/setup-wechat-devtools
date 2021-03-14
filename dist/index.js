"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const InstallerFactory_1 = require("./base/InstallerFactory");
(async function main() {
    const setup = InstallerFactory_1.default.getInstance();
    if (!setup) {
        core.setFailed('The operating system is not supported.');
        return;
    }
    try {
        core.info('Downloading WeChat DevTools...');
        await setup.download();
        core.info('Installing...');
        await setup.install();
        await setup.vars();
    }
    catch (error) {
        core.setFailed(error);
    }
}());
