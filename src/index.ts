import * as core from '@actions/core';
import Installer from './Installer';
import Launcher from './Launcher';

(async function main(): Promise<void> {
	try {
		const setup = new Installer();
		await setup.download();
		await setup.install();

		const projectPath = core.getInput('project-path') || '.';
		const port = core.getInput('port') || '8888';
		const launcher = new Launcher(projectPath, port);
		await launcher.start();
	} catch (error) {
		core.setFailed(error);
	}
}());
