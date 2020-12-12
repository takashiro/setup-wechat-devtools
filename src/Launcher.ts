import * as fs from 'fs';
import * as os from 'os';
import * as exec from 'execa';

const searchDir: Record<string, string[]> = {
	win32: [
		'C:\\Progra~1\\Tencent\\微信web开发者工具',
		'C:\\Progra~2\\Tencent\\微信web开发者工具',
	],
	darwin: [
	],
};

function findInstallDir(): string {
	const dirs = searchDir[os.platform()];
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
		const cwd = findInstallDir();
		if (!cwd) {
			throw new Error('Failed to locate CLI of WeChat Developer Tools.');
		}

		await exec('cli.bat', ['auto', '--project', this.projectPath, '--auto-port', this.port], {
			cwd,
			stdio: 'inherit',
		});
	}
}
