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

interface InstallSource {
	url: string;
	ext: string;
	sha1sum: string;
	cli: string;
	location: string;
}

function createDownloadLink(type: string, version: string): string {
	return `https://servicewechat.com/wxa-dev-logic/download_redirect?type=${type}&from=mpwiki&download_version=${version}&version_type=1`;
}

const devtoolVersion = '1032101150';
const installSource: Record<string, InstallSource> = {
	win32: {
		url: createDownloadLink('x64', devtoolVersion),
		ext: 'exe',
		sha1sum: '3357ae1a50e9b8295eb7a9cf86ac3cb03f0e8657',
		cli: 'cli.bat',
		location: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具',
	},
	darwin: {
		url: createDownloadLink('darwin', devtoolVersion),
		ext: 'dmg',
		sha1sum: '1698d35268c0b72451266b98c5ed98aae1b1e2a6',
		cli: 'cli',
		location: '/Applications/wechatwebdevtools.app/Contents/MacOS/',
	},
};

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

export default class Installer {
	protected source: InstallSource;

	protected saveTo: string;

	constructor() {
		const source = installSource[os.platform()];
		if (!source) {
			throw new Error('The current platform is not supported.');
		}
		this.source = source;
		this.saveTo = path.join(os.tmpdir(), `wechat-devtool-installer.${source.ext}`);
	}

	async download(): Promise<void> {
		const res = await this.openConnection();
		await save(res, this.saveTo);

		const fingerprint = await sha1(this.saveTo);
		if (fingerprint !== this.source.sha1sum) {
			throw new Error(`Downloaded file may be corrupted. Incorrect SHA1 fingerprint: ${fingerprint} Expected: ${this.source.sha1sum}`);
		}
	}

	async install(): Promise<void> {
		if (!fs.existsSync(this.saveTo)) {
			throw new Error('Installer has not been downloaded yet.');
		}

		const win32 = this.source.ext === 'exe';
		if (win32) {
			await exec(this.saveTo, ['/S']);
			await join('wechat-devtool-installer.exe');
		} else {
			await exec(`hdiutil attach ${this.saveTo}`, { shell: true });
			await exec('sudo cp -r "/Volumes/微信开发者工具 Stable/wechatwebdevtools.app" /Applications/wechatwebdevtools.app', { shell: true });
			await exec('hdiutil detach "/Volumes/微信开发者工具 Stable/"', { shell: true });
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
		let link = this.source.url;
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
