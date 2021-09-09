import * as core from '@actions/core';
import Installer from './base/Installer';

(async function main(): Promise<void> {
	const setup = Installer.getInstance();
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
	} catch (error) {
		if (error instanceof Error) {
			core.setFailed(error);
		} else {
			core.setFailed(String(error));
		}
	}
}());
