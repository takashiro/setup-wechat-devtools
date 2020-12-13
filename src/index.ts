import * as core from '@actions/core';
import Installer from './base/Installer';

(async function main(): Promise<void> {
	try {
		const setup = new Installer();

		core.info('Downloading WeChat DevTools...');
		await setup.download();

		core.info('Installing...');
		await setup.install();
	} catch (error) {
		core.setFailed(error);
	}
}());
