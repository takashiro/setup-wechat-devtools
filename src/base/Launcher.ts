import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as exec from 'execa';

import email from '../util/email';
import exist from '../util/exist';

const readdir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);

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

async function allowCli(): Promise<void> {
	const appDataDir = process.env.LOCALAPPDATA;
	if (!appDataDir) {
		throw new Error('AppData directory is not found.');
	}

	const userDataDir = path.join(appDataDir, '微信开发者工具', 'User Data');
	const userDirs = await readdir(userDataDir);
	for (const userDir of userDirs) {
		if (userDir === 'Crashpad' || userDir.startsWith('.')) {
			continue;
		}

		const markFile = path.join(userDataDir, userDir, 'Default', '.ide-status');
		await writeFile(markFile, 'On', { encoding: 'utf-8' });
	}
}

export default class Launcher {
	protected projectPath: string;

	protected port: string;

	protected readonly cwd: string;

	constructor(projectPath: string, port: string) {
		this.projectPath = projectPath;
		this.port = port;

		const cwd = findInstallDir();
		if (!cwd) {
			throw new Error('Failed to locate CLI of WeChat Developer Tools.');
		}
		this.cwd = cwd;
	}

	async login(): Promise<void> {
		await this.exec('微信开发者工具.exe', ['--disable-gpu']);
		await allowCli();
		await this.cli(['quit']);

		const loginQrCode = path.join(os.tmpdir(), 'login-qrcode.png');
		await Promise.all([
			this.cli(['login', '-f', 'image', '-o', loginQrCode]),
			sendLoginCode(loginQrCode),
		]);
	}

	async launch(): Promise<void> {
		await this.cli(['auto', '--project', this.projectPath, '--auto-port', this.port]);
	}

	cli(args: string[], options?: exec.Options): exec.ExecaChildProcess<string> {
		args.push('--disable-gpu');
		return this.exec('cli.bat', args, options);
	}

	exec(cmd: string, args?: string[], options?: exec.Options): exec.ExecaChildProcess<string> {
		return exec(cmd, args, options || {
			cwd: this.cwd,
			stdio: 'inherit',
		});
	}
}
