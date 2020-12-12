import * as core from '@actions/core';
import Installer from './base/Installer';
import Launcher from './base/Launcher';

(async function main(): Promise<void> {
	try {
		const setup = new Installer();

		core.info('Downloading WeChat DevTools...');
		await setup.download();

		core.info('Installing...');
		await setup.install();

		const projectPath = core.getInput('project-path') || '.';
		const port = core.getInput('port') || '8888';
		const launcher = new Launcher(projectPath, port);

		core.info('A Login QR Code of WeChat DevTools will be sent to your email.');
		await launcher.login();

		core.info('Launching the project...');
		await launcher.launch();
	} catch (error) {
		core.setFailed(error);
	}
}());
