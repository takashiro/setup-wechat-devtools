import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as https from 'https';
import { IncomingMessage } from 'http';
import * as exec from 'execa';
import * as core from '@actions/core';

import sha1 from '../util/sha1';
import join from '../util/join';

const mkdir = util.promisify(fs.mkdir);
const copyFile = util.promisify(fs.copyFile);

function openConnection(source: string): Promise<IncomingMessage> {
	return new Promise((resolve) => {
		const req = https.get(source, resolve);
		req.end();
	});
}

function save(res: IncomingMessage, saveTo: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const output = fs.createWriteStream(saveTo, 'binary');
		output.once('close', resolve);
		output.once('error', reject);
		res.pipe(output);
	});
}

interface InstallerConfig {
	downloadUrl: string;
	fileExtension: string;
	sha1sum: string;
	installDir: string;
	workDir: string;
}

export default class Installer {
	protected downloadUrl: string;

	protected saveTo: string;

	protected sha1sum: string;

	protected installDir: string;

	protected workDir: string;

	constructor(config: InstallerConfig) {
		this.downloadUrl = config.downloadUrl;
		this.saveTo = path.join(os.tmpdir(), `wechat-devtool-installer.${config.fileExtension}`);
		this.sha1sum = config.sha1sum;
		this.installDir = config.installDir;
		this.workDir = path.join(config.installDir, config.workDir);
	}

	getInstallDir(): string {
		return this.installDir;
	}

	getWorkDir(): string {
		return this.workDir;
	}

	async download(): Promise<void> {
		const res = await this.openConnection();
		await save(res, this.saveTo);

		const fingerprint = await sha1(this.saveTo);
		if (fingerprint !== this.sha1sum) {
			throw new Error(`Downloaded file may be corrupted. Incorrect SHA1 fingerprint: ${fingerprint} Expected: ${this.sha1sum}`);
		}
	}

	async install(): Promise<void> {
		if (!fs.existsSync(this.saveTo)) {
			throw new Error('Installer has not been downloaded yet.');
		}

		const win32 = this.saveTo.endsWith('.exe');
		if (win32) {
			await exec(this.saveTo, ['/S']);
			await join('wechat-devtool-installer.exe');
		} else {
			await exec('hdiutil', ['attach', this.saveTo]);
			await exec('sudo', ['cp', '-r', '/Volumes/微信开发者工具 Stable/wechatwebdevtools.app', this.installDir]);
			await exec('hdiutil', ['detach', '/Volumes/微信开发者工具 Stable/']);
		}

		const rootDir = path.dirname(path.dirname(__dirname));
		const fromDir = path.join(rootDir, 'src', 'bin');
		const toDir = path.join(rootDir, 'bin');
		await mkdir(toDir);
		core.addPath(toDir);

		const cli = core.getInput('cli') || 'wxdev';
		if (win32) {
			await copyFile(path.join(fromDir, 'cli.cmd'), path.join(toDir, `${cli}.cmd`));
			await copyFile(path.join(fromDir, 'cli.ps1'), path.join(toDir, `${cli}.ps1`));
		} else {
			await copyFile(path.join(fromDir, 'cli.sh'), path.join(toDir, cli));
		}
	}

	async openConnection(): Promise<IncomingMessage> {
		let link = this.downloadUrl;
		for (;;) {
			const res: IncomingMessage = await openConnection(link);
			if (res.statusCode === 301 || res.statusCode === 302) {
				const { location } = res.headers;
				if (location) {
					link = location;
				} else {
					throw new Error('Received redirect without a new location.');
				}
			} else if (res.statusCode !== 200) {
				throw new Error(`Invalid download source. Status Code: ${res.statusCode}`);
			} else {
				return res;
			}
		}
	}
}
