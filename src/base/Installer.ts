import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as exec from 'execa';
import * as core from '@actions/core';
import * as cache from '@actions/tool-cache';

import sha1 from '../util/sha1';
import join from '../util/join';

const mkdir = util.promisify(fs.mkdir);
const copyFile = util.promisify(fs.copyFile);

interface InstallerConfig {
	version: string;
	platform: string;
	downloadUrl: string;
	fileExtension: string;
	sha1sum: string;
	installDir: string;
}

export default class Installer {
	protected version: string;

	protected platform: string;

	protected downloadUrl: string;

	protected saveTo: string;

	protected sha1sum: string;

	protected installDir: string;

	constructor(config: InstallerConfig) {
		this.version = config.version;
		this.platform = config.platform;
		this.downloadUrl = config.downloadUrl;
		this.saveTo = path.join(os.tmpdir(), `wechat-devtool-installer.${config.fileExtension}`);
		this.sha1sum = config.sha1sum;
		this.installDir = config.installDir;
	}

	getInstallDir(): string {
		return this.installDir;
	}

	async download(): Promise<void> {
		const savedTo = await cache.downloadTool(this.downloadUrl, this.saveTo);
		const fingerprint = await sha1(savedTo);
		if (fingerprint !== this.sha1sum) {
			throw new Error(`Downloaded file may be corrupted. Incorrect SHA1 fingerprint: ${fingerprint} Expected: ${this.sha1sum}`);
		}
	}

	async install(): Promise<void> {
		if (!fs.existsSync(this.saveTo)) {
			throw new Error('Installer has not been downloaded yet.');
		}

		if (this.platform === 'x64') {
			await exec(this.saveTo, ['/S']);
			await join('wechat-devtool-installer.exe');
		} else {
			await exec('hdiutil', ['attach', this.saveTo]);
			await exec('sudo', ['cp', '-r', '/Volumes/微信开发者工具 Stable/wechatwebdevtools.app', this.installDir]);
			await exec('hdiutil', ['detach', '/Volumes/微信开发者工具 Stable/']);
		}
	}

	async vars(): Promise<void> {
		const rootDir = path.dirname(path.dirname(__dirname));
		const fromDir = path.join(rootDir, 'src', 'bin');
		const toDir = path.join(rootDir, 'bin');
		await mkdir(toDir);
		core.addPath(toDir);

		const cli = core.getInput('cli') || 'wxdev';
		if (this.platform === 'x64') {
			await copyFile(path.join(fromDir, 'cli.cmd'), path.join(toDir, `${cli}.cmd`));
			await copyFile(path.join(fromDir, 'cli.ps1'), path.join(toDir, `${cli}.ps1`));
		} else {
			await copyFile(path.join(fromDir, 'cli.sh'), path.join(toDir, cli));
		}
	}
}
