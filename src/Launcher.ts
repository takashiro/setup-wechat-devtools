import * as fs from 'fs';
import * as os from 'os';
import { exec } from '@actions/exec';

const workDir: Record<string, string[]> = {
	win32: [
		'C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat',
		'C:/Program Files/Tencent/微信web开发者工具/cli.bat',
	],
	darwin: [
	],
};

function findCli(): string {
	const dirs = workDir[os.platform()];
	if (!dirs) {
		return '';
	}
	for (const dir of dirs) {
		if (fs.existsSync(dir)) {
			return dir;
		}
	}
	return '';
}

export default class Launcher {
	protected projectPath: string;

	protected port: string;

	constructor(projectPath: string, port: string) {
		this.projectPath = projectPath;
		this.port = port;
	}

	async start(): Promise<void> {
		const cli = findCli();
		if (!cli) {
			throw new Error('Failed to locate CLI of WeChat Developer Tools.');
		}

		await exec(`"${cli}"`, ['auto', '--project', this.projectPath, '--auto-port', this.port]);
	}
}
