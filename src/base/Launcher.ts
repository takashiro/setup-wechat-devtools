import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as exec from 'execa';

import email from '../util/email';
import exist from '../util/exist';

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

async function sendLoginCode(qrcode: string): Promise<void> {
	await exist(qrcode);

	const workflow = process.env.GITHUB_WORKFLOW;
	const actor = process.env.GITHUB_ACTOR;
	const repository = process.env.GITHUB_REPOSITORY;
	const sha = process.env.GITHUB_SHA;

	await email({
		subject: `[${workflow}] Login Request for ${repository} by ${actor}`,
		html: `<p>Commit: ${sha}</p><p><img src="cid:login-qrcode" /></p>`,
		attachments: [
			{
				filename: 'login-qrcode.png',
				path: qrcode,
				cid: 'login-qrcode',
			},
		],
	});
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

		const options: exec.Options = {
			cwd,
			stdio: 'inherit',
		};

		const loginQrCode = path.join(os.tmpdir(), 'login-qrcode.png');

		await exec('微信开发者工具.exe', options);
		await Promise.all([
			exec('cli.bat', ['login', '-f', 'image', '-o', loginQrCode], {
				cwd,
				input: 'y\n',
				stdout: 'inherit',
			}),
			sendLoginCode(loginQrCode),
		]);
		await exec('cli.bat', ['auto', '--project', this.projectPath, '--auto-port', this.port], options);
	}
}
