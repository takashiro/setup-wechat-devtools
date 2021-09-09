"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const Installer_1 = require("./base/Installer");
(async function main() {
    const setup = Installer_1.default.getInstance();
    if (!setup) {
        core.setFailed('The operating system is not supported.');
        return;
    }
    try {
        core.info('Downloading WeChat DevTools...');
        await setup.download();
        core.info('Installing...');
        await setup.install();
        core.info(`Installed to ${setup.getInstallDir()}`);
        core.info('Setting up environment variables...');
        await setup.vars();
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error);
        }
        else {
            core.setFailed(String(error));
        }
    }
}());
