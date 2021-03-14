import * as core from '@actions/core';
import InstallerFactory from './base/InstallerFactory';

(async function main(): Promise<void> {
	const setup = InstallerFactory.getInstance();
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
		core.setFailed(error);
	}
}());
